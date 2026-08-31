using Abp;
using Abp.Configuration.Startup;
using Abp.Data;
using Abp.Domain.Entities;
using Abp.Reflection.Extensions;
using Abp.Runtime.Caching;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using System.Runtime.Serialization;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Used to store cache in a Redis server.
    /// </summary>
    public class ShaRedisCache : CacheBase
    {
        private readonly IDatabase _database;
        private readonly IRedisCacheSerializer _serializer;

        /// <summary>
        /// In-process cache in front of Redis. Null when disabled via
        /// <see cref="ShaRedisCacheOptions.L1Enabled"/>, in which case every read goes to Redis as
        /// before.
        /// </summary>
        private readonly ShaRedisCacheL1Store? _l1;

        private readonly IShaCacheInvalidationBus? _invalidationBus;

        protected IShaRedisCacheKeyNormalizer KeyNormalizer { get; }
        protected IMultiTenancyConfig MultiTenancyConfig { get; }

        /// <summary>
        /// Constructor.
        /// </summary>
        public ShaRedisCache(
            string name,
            IShaRedisCacheDatabaseProvider redisCacheDatabaseProvider,
            IRedisCacheSerializer redisCacheSerializer,
            IShaRedisCacheKeyNormalizer keyNormalizer,
            IMultiTenancyConfig multiTenancyConfig,
            ShaRedisCacheOptions options,
            IShaCacheInvalidationBus invalidationBus,
            IShaCacheStatistics statistics)
            : base(name)
        {
            _database = redisCacheDatabaseProvider.GetDatabase();
            _serializer = redisCacheSerializer;
            KeyNormalizer = keyNormalizer;
            MultiTenancyConfig = multiTenancyConfig;

            if (options.L1Enabled)
            {
                _l1 = new ShaRedisCacheL1Store(
                    name,
                    TimeSpan.FromSeconds(Math.Max(1, options.L1ExpirationSeconds)),
                    options.L1MaxEntriesPerCache);

                statistics.Register(_l1);

                _invalidationBus = invalidationBus;

                // Another instance changed a key: drop our copy so the next read reloads it.
                _invalidationBus.Subscribe(name, key =>
                {
                    if (key == IShaCacheInvalidationBus.ClearAllKeys)
                        _l1.Clear();
                    else
                        _l1.Remove(key);
                });
            }
        }

        /// <summary>
        /// Invalidates a key locally and tells the other instances to do the same.
        /// Local first: the bus ignores our own broadcast, so the local drop must already have
        /// happened by the time we publish.
        /// </summary>
        protected virtual void InvalidateL1(RedisKey normalizedKey)
        {
            if (_l1 == null)
                return;

            var key = normalizedKey.ToString();
            _l1.Remove(key);
            _invalidationBus?.Publish(Name, key);
        }

        /// <inheritdoc cref="InvalidateL1(RedisKey)"/>
        protected virtual async Task InvalidateL1Async(RedisKey normalizedKey)
        {
            if (_l1 == null)
                return;

            var key = normalizedKey.ToString();
            _l1.Remove(key);
            if (_invalidationBus != null)
                await _invalidationBus.PublishAsync(Name, key);
        }

        /// <summary>
        /// The lifetime a write is asking Redis for, so L1 can be bounded by it. Callers such
        /// as the OTP store pass a remaining lifetime that shrinks as the value ages, and that
        /// can easily be shorter than the configured L1 TTL.
        /// </summary>
        private TimeSpan? RequestedLifetime(
            string key, TimeSpan? slidingExpireTime, DateTimeOffset? absoluteExpireTime)
        {
            if (absoluteExpireTime.HasValue)
                return absoluteExpireTime.Value - DateTimeOffset.UtcNow;

            if (slidingExpireTime.HasValue)
                return slidingExpireTime.Value;

            if (DefaultAbsoluteExpireTimeFactory != null)
                return DefaultAbsoluteExpireTimeFactory(key) - DateTimeOffset.UtcNow;

            if (DefaultAbsoluteExpireTime.HasValue)
                return DefaultAbsoluteExpireTime.Value - DateTimeOffset.UtcNow;

            return DefaultSlidingExpireTime;
        }

        /// <summary>
        /// Stores a freshly read or written value in L1.
        ///
        /// The value is cached AS IS, deserialized, so every subsequent hit returns the same
        /// object instance until the entry is invalidated. That is deliberate and is the whole
        /// benefit: the cost being removed here is the JSON deserialization on every read, so
        /// caching a serialized payload or copying on read would reinstate it.
        ///
        /// It also matches ABP's in-memory cache (<c>AbpMemoryCache</c>), which has always handed
        /// out shared references; the previous Redis behaviour of returning a fresh copy per read
        /// was the outlier.
        ///
        /// Callers must therefore treat values obtained from the cache as read-only. Anything that
        /// genuinely needs an isolated instance should copy it itself, or run with
        /// <see cref="ShaRedisCacheOptions.L1Enabled"/> set to false.
        /// </summary>
        /// <param name="maxLifetime">
        /// Time the Redis key has left. L1 is bounded by this so it can never serve a value
        /// after Redis has expired it -- important for short-lived entries such as one-time
        /// pins, whose expiry shrinks towards zero as they age.
        /// </param>
        protected virtual void PopulateL1(RedisKey normalizedKey, object? value, TimeSpan? maxLifetime = null)
        {
            _l1?.Set(normalizedKey.ToString(), value, maxLifetime);
        }

        protected virtual RedisKey NormalizeKey(string key)
        {
            return KeyNormalizer.NormalizeKey(
                new ShaRedisCacheKeyNormalizeArgs(
                    key,
                    Name,
                    MultiTenancyConfig.IsEnabled
                )
            );
        }

        public override bool TryGetValue(string key, [NotNullWhen(true)] out object? value) // TODO: review nullability of value
        {
            var normalizedKey = NormalizeKey(key);

            // L1 first: a hit skips both the network round-trip and the JSON deserialization that
            // dominated the profile.
            if (_l1 != null && _l1.TryGet(normalizedKey.ToString(), out var cached) && cached != null)
            {
                value = cached;
                return true;
            }

            // WithExpiry so L1 can be bounded by whatever the key has left, in the same
            // round-trip rather than an extra TTL call.
            var withExpiry = _database.StringGetWithExpiry(normalizedKey);
            var redisValue = withExpiry.Value;
            if (!redisValue.HasValue) { 
                value = null;
                return false;
            }

            try
            {
                value = Deserialize(redisValue);
                PopulateL1(normalizedKey, value, withExpiry.Expiry);
                return true;
            }
            catch (Exception ex) when (ex is JsonException || ex is SerializationException
                                       || ex is FileNotFoundException || ex is TypeLoadException)
            {
                // FileNotFoundException covers a cached type whose assembly is gone;
                // TypeLoadException covers one whose assembly still loads but the type was renamed
                // or moved. Either way the entry can never be deserialized again, so evict it
                // rather than let it fail every request until it expires.
                Logger.Warn($"Failed to deserialize value for key: {key}, removed from cache", ex);
                SafeDeleteKey(normalizedKey);
                InvalidateL1(normalizedKey);
                value = null;
                return false;
            }            
        }

        public override ConditionalValue<object>[] TryGetValues(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey).ToArray();
            var redisValues = _database.StringGet(redisKeys);
            return redisValues.Select((value, idx) => CreateConditionalValue(redisKeys[idx], value, maxLifetime: null)).ToArray();
        }

        public override async Task<ConditionalValue<object>> TryGetValueAsync(string key)
        {
            var normalizedKey = NormalizeKey(key);

            // This is the hot path the Azure profile pointed at: the per-request permission
            // lookup. An L1 hit avoids both the round-trip and the deserialization.
            if (_l1 != null && _l1.TryGet(normalizedKey.ToString(), out var cached) && cached != null)
                return new ConditionalValue<object>(true, cached);

            var withExpiry = await _database.StringGetWithExpiryAsync(normalizedKey);
            return CreateConditionalValue(normalizedKey, withExpiry.Value, withExpiry.Expiry);
        }

        public override async Task<ConditionalValue<object>[]> TryGetValuesAsync(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey).ToArray();
            var redisValues = await _database.StringGetAsync(redisKeys);
            return redisValues.Select((value, idx) => CreateConditionalValue(redisKeys[idx], value, maxLifetime: null)).ToArray();
        }

        public override void Set(string key, object value, TimeSpan? slidingExpireTime = null, DateTimeOffset? absoluteExpireTime = null)
        {
            if (value == null)
            {
                throw new AbpException("Can not insert null values to the cache!");
            }

            var redisKey = NormalizeKey(key);
            var redisValue = Serialize(value, GetSerializableType(value));

            bool stored;

            if (absoluteExpireTime.HasValue)
            {
                stored = _database.StringSet(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} in Redis", redisKey, redisValue);
                }
                else if (!_database.KeyExpire(redisKey, absoluteExpireTime.Value.UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", redisKey, absoluteExpireTime.Value.UtcDateTime);
                }
            }
            else if (slidingExpireTime.HasValue)
            {
                stored = _database.StringSet(redisKey, redisValue, slidingExpireTime.Value);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", redisKey, redisValue, slidingExpireTime.Value);
                }
            }
            else if (DefaultAbsoluteExpireTimeFactory != null)
            {
                stored = _database.StringSet(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} in Redis", redisKey, redisValue);
                }
                else if (!_database.KeyExpire(redisKey, DefaultAbsoluteExpireTimeFactory(key).UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", redisKey, DefaultAbsoluteExpireTimeFactory(key).UtcDateTime);
                }
            }
            else if (DefaultAbsoluteExpireTime.HasValue)
            {
                stored = _database.StringSet(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} in Redis", redisKey, redisValue);
                }
                else if (!_database.KeyExpire(redisKey, DefaultAbsoluteExpireTime.Value.UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", redisKey, DefaultAbsoluteExpireTime.Value.UtcDateTime);
                }
            }
            else
            {
                stored = _database.StringSet(redisKey, redisValue, DefaultSlidingExpireTime);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", redisKey, redisValue, DefaultSlidingExpireTime);
                }
            }

            // Only once Redis has accepted the value. Refreshing L1 or broadcasting beforehand
            // would leave this node serving a value Redis never stored, and would let the other
            // nodes drop their entry and repopulate it from the pre-write value.
            // A failed KeyExpire is not a failed write -- the value is in Redis, just without
            // the expiry -- so L1 keys off the StringSet result only.
            if (stored)
            {
                PopulateL1(redisKey, value, RequestedLifetime(key, slidingExpireTime, absoluteExpireTime));
                _invalidationBus?.Publish(Name, redisKey.ToString());
            }
        }

        public override async Task SetAsync(string key, object value, TimeSpan? slidingExpireTime = null, DateTimeOffset? absoluteExpireTime = null)
        {
            if (value == null)
            {
                throw new AbpException("Can not insert null values to the cache!");
            }

            var redisKey = NormalizeKey(key);
            var redisValue = Serialize(value, GetSerializableType(value));

            bool stored;

            if (absoluteExpireTime.HasValue)
            {
                stored = await _database.StringSetAsync(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} asynchronously in Redis", redisKey, redisValue);
                }
                else if (!await _database.KeyExpireAsync(redisKey, absoluteExpireTime.Value.UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", redisKey, absoluteExpireTime.Value.UtcDateTime);
                }
            }
            else if (slidingExpireTime.HasValue)
            {
                stored = await _database.StringSetAsync(redisKey, redisValue, slidingExpireTime.Value);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", redisKey, redisValue, slidingExpireTime.Value);
                }
            }
            else if (DefaultAbsoluteExpireTimeFactory != null)
            {
                stored = await _database.StringSetAsync(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} asynchronously in Redis", redisKey, redisValue);
                }
                else if (!await _database.KeyExpireAsync(redisKey, DefaultAbsoluteExpireTimeFactory(key).UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", redisKey, DefaultAbsoluteExpireTimeFactory(key).UtcDateTime);
                }
            }
            else if (DefaultAbsoluteExpireTime.HasValue)
            {
                stored = await _database.StringSetAsync(redisKey, redisValue);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} asynchronously in Redis", redisKey, redisValue);
                }
                else if (!await _database.KeyExpireAsync(redisKey, DefaultAbsoluteExpireTime.Value.UtcDateTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", redisKey, DefaultAbsoluteExpireTime.Value.UtcDateTime);
                }
            }
            else
            {
                stored = await _database.StringSetAsync(redisKey, redisValue, DefaultSlidingExpireTime);
                if (!stored)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", redisKey, redisValue, DefaultSlidingExpireTime);
                }
            }

            // See Set: L1 and the broadcast happen only once Redis has accepted the value.
            if (stored)
            {
                PopulateL1(redisKey, value, RequestedLifetime(key, slidingExpireTime, absoluteExpireTime));
                if (_invalidationBus != null)
                    await _invalidationBus.PublishAsync(Name, redisKey.ToString());
            }
        }

        public override void Set(KeyValuePair<string, object>[] pairs, TimeSpan? slidingExpireTime = null, DateTimeOffset? absoluteExpireTime = null)
        {
            if (pairs.Any(p => p.Value == null))
            {
                throw new AbpException("Can not insert null values to the cache!");
            }

            var redisPairs = pairs.Select(p => {
                var redisKey = NormalizeKey(p.Key);
                var redisValue = Serialize(p.Value, GetSerializableType(p.Value));
                return new KeyValuePair<RedisKey, RedisValue>(redisKey, redisValue);
            }).ToList();

            if (!_database.StringSet(redisPairs.ToArray()))
            {
                foreach (var pair in redisPairs)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} in Redis", pair.Key, pair.Value);
                }

                return;
            }

            // Only once Redis has accepted the batch. redisPairs is built from pairs in order, so
            // the indexes line up; PopulateL1 needs the original value, not the serialized form.
            for (var i = 0; i < redisPairs.Count; i++)
            {
                PopulateL1(redisPairs[i].Key, pairs[i].Value, RequestedLifetime(pairs[i].Key, slidingExpireTime, absoluteExpireTime));
                _invalidationBus?.Publish(Name, redisPairs[i].Key.ToString());
            }

            if (absoluteExpireTime.HasValue)
            {
                foreach (var pair in redisPairs)
                {
                    if (!_database.KeyExpire(pair.Key, absoluteExpireTime.Value.UtcDateTime))
                    {
                        Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", pair.Key, absoluteExpireTime.Value.UtcDateTime);
                    }
                }
            }
            else if (slidingExpireTime.HasValue)
            {
                foreach (var pair in redisPairs)
                {
                    if (!_database.KeyExpire(pair.Key, slidingExpireTime.Value))
                    {
                        Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", pair.Key, pair.Value, slidingExpireTime.Value);
                    }
                }
            }
            else if (DefaultAbsoluteExpireTimeFactory != null)
            {
                foreach (var pair in redisPairs)
                {
                    if (!_database.KeyExpire(pair.Key, DefaultAbsoluteExpireTimeFactory(pair.Key).UtcDateTime))
                    {
                        Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", pair.Key, DefaultAbsoluteExpireTimeFactory(pair.Key).UtcDateTime);
                    }
                }
            }
            else if (DefaultAbsoluteExpireTime.HasValue)
            {
                foreach (var pair in redisPairs)
                {
                    if (!_database.KeyExpire(pair.Key, DefaultAbsoluteExpireTime.Value.UtcDateTime))
                    {
                        Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} in Redis", pair.Key, DefaultAbsoluteExpireTime.Value.UtcDateTime);
                    }
                }
            }
            else
            {
                foreach (var pair in redisPairs)
                {
                    if (!_database.KeyExpire(pair.Key, DefaultSlidingExpireTime))
                    {
                        Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", pair.Key, pair.Value, DefaultSlidingExpireTime);
                    }
                }
            }
        }

        public override async Task SetAsync(KeyValuePair<string, object>[] pairs, TimeSpan? slidingExpireTime = null, DateTimeOffset? absoluteExpireTime = null)
        {
            if (pairs.Any(p => p.Value == null))
            {
                throw new AbpException("Can not insert null values to the cache!");
            }

            var redisPairs = pairs.Select(p => {
                var redisKey = NormalizeKey(p.Key);
                var redisValue = Serialize(p.Value, GetSerializableType(p.Value));
                return new KeyValuePair<RedisKey, RedisValue>(redisKey, redisValue);
            }).ToList();

            if (!await _database.StringSetAsync(redisPairs.ToArray()))
            {
                foreach (var pair in redisPairs)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} asynchronously in Redis", pair.Key, pair.Value);
                }
            }
            else
            {
                // Only once Redis has accepted the batch. redisPairs is built from pairs in order,
                // so the indexes line up; PopulateL1 needs the original value.
                for (var i = 0; i < redisPairs.Count; i++)
                {
                    PopulateL1(redisPairs[i].Key, pairs[i].Value, RequestedLifetime(pairs[i].Key, slidingExpireTime, absoluteExpireTime));
                    if (_invalidationBus != null)
                        await _invalidationBus.PublishAsync(Name, redisPairs[i].Key.ToString());
                }

                if (absoluteExpireTime.HasValue)
                {
                    foreach (var pair in redisPairs)
                    {
                        if (!await _database.KeyExpireAsync(pair.Key, absoluteExpireTime.Value.UtcDateTime))
                        {
                            Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", pair.Key, absoluteExpireTime.Value.UtcDateTime);
                        }
                    }
                }
                else if (slidingExpireTime.HasValue)
                {
                    foreach (var pair in redisPairs)
                    {
                        if (!await _database.KeyExpireAsync(pair.Key, slidingExpireTime.Value))
                        {
                            Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", pair.Key, pair.Value, slidingExpireTime.Value);
                        }
                    }
                }
                else if (DefaultAbsoluteExpireTimeFactory != null)
                {
                    foreach (var pair in redisPairs)
                    {
                        if (!await _database.KeyExpireAsync(pair.Key, DefaultAbsoluteExpireTimeFactory(pair.Key).UtcDateTime))
                        {
                            Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", pair.Key, DefaultAbsoluteExpireTimeFactory(pair.Key).UtcDateTime);
                        }
                    }
                }
                else if (DefaultAbsoluteExpireTime.HasValue)
                {
                    foreach (var pair in redisPairs)
                    {
                        if (!await _database.KeyExpireAsync(pair.Key, DefaultAbsoluteExpireTime.Value.UtcDateTime))
                        {
                            Logger.ErrorFormat("Unable to set key:{0} to expire at {1:O} asynchronously in Redis", pair.Key, DefaultAbsoluteExpireTime.Value.UtcDateTime);
                        }
                    }
                }
                else
                {
                    foreach (var pair in redisPairs)
                    {
                        if (!await _database.KeyExpireAsync(pair.Key, DefaultSlidingExpireTime))
                        {
                            Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", pair.Key, pair.Value, DefaultSlidingExpireTime);
                        }
                    }
                }
            }
        }

        public override void Remove(string key)
        {
            var redisKey = NormalizeKey(key);
            _database.KeyDelete(redisKey);
            InvalidateL1(redisKey);
        }

        public override async Task RemoveAsync(string key)
        {
            var redisKey = NormalizeKey(key);
            await _database.KeyDeleteAsync(redisKey);
            await InvalidateL1Async(redisKey);
        }

        public override void Remove(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey).ToArray();
            _database.KeyDelete(redisKeys);

            foreach (var redisKey in redisKeys)
                InvalidateL1(redisKey);
        }

        public override async Task RemoveAsync(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey).ToArray();
            await _database.KeyDeleteAsync(redisKeys);

            foreach (var redisKey in redisKeys)
                await InvalidateL1Async(redisKey);
        }

        public override void Clear()
        {
            ClearRedisCacheInternal();
            ClearL1();
        }

        /// <summary>
        /// Drops every local entry and tells the other instances to do the same. A clear that only
        /// emptied Redis would leave stale copies alive in every other process until they expired.
        /// </summary>
        protected virtual void ClearL1()
        {
            if (_l1 == null)
                return;

            _l1.Clear();
            _invalidationBus?.Publish(Name, IShaCacheInvalidationBus.ClearAllKeys);
        }

        protected virtual void ClearRedisCacheInternal()
        {
            _database.KeyDeleteWithPrefix(NormalizeKey("*"));
        }
        
        protected virtual Type GetSerializableType(object value)
        {
            //TODO: This is a workaround for serialization problems of entities.
            //TODO: Normally, entities should not be stored in the cache, but currently Abp.Zero packages does it. It will be fixed in the future.
            var type = value.GetType();
            if (EntityHelper.IsEntity(type) && type.GetAssembly().FullName?.Contains("EntityFrameworkDynamicProxies") == true)
            {
                var baseType = type.GetTypeInfo().BaseType;
                if (baseType != null)
                    type = baseType;
            }
            return type;
        }

        /// <param name="maxLifetime">
        /// Time the Redis key has left, bounding the L1 entry. Null means "do not populate L1":
        /// the batch reads use StringGet, which cannot return per-key TTLs, so caching from
        /// there could outlive a short-lived key.
        /// </param>
        protected ConditionalValue<object> CreateConditionalValue(
            RedisKey key, RedisValue redisValue, TimeSpan? maxLifetime)
        {
            if (!redisValue.HasValue)
                return new ConditionalValue<object>(false, null!);

            try
            {
                var deserialized = Deserialize(redisValue);
                if (maxLifetime.HasValue)
                    PopulateL1(key, deserialized, maxLifetime);
                return new ConditionalValue<object>(true, deserialized);
            }
            catch (Exception ex) when (ex is JsonException || ex is SerializationException
                                       || ex is FileNotFoundException || ex is TypeLoadException)
            {
                SafeDeleteKey(key);
                InvalidateL1(key);

                // See TryGetValue: TypeLoadException means the cached type no longer exists.
                Logger.Warn($"Failed to deserialize value for key: {key} - skipped", ex);
                return new ConditionalValue<object>(false, null!);
            }
        }

        private void SafeDeleteKey(RedisKey key)
        {
            try
            {
                _database.KeyDelete(key);
            }
            catch
            { 
                // noop
            }
        }

        protected virtual string? Serialize(object value, Type type)
        {
            return _serializer.Serialize(value, type);
        }

        protected virtual object Deserialize(RedisValue objbyte)
        {
            return _serializer.Deserialize(objbyte);
        }
    }
}
