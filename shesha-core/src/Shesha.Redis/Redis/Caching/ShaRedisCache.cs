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
            IMultiTenancyConfig multiTenancyConfig)
            : base(name)
        {
            _database = redisCacheDatabaseProvider.GetDatabase();
            _serializer = redisCacheSerializer;
            KeyNormalizer = keyNormalizer;
            MultiTenancyConfig = multiTenancyConfig;
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
            var redisValue = _database.StringGet(normalizedKey);
            if (!redisValue.HasValue) { 
                value = null;
                return false;
            }

            try
            {
                value = Deserialize(redisValue);
                return true;
            }
            catch (Exception ex) when (ex is JsonException || ex is SerializationException || ex is FileNotFoundException)
            {
                Logger.Warn($"Failed to deserialize value for key: {key}, removed from cache", ex);
                SafeDeleteKey(normalizedKey);                
                value = null;
                return false;
            }            
        }

        public override ConditionalValue<object>[] TryGetValues(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey);
            var redisValues = _database.StringGet(redisKeys.ToArray());
            return redisValues.Select((value, idx) => CreateConditionalValue(keys[idx], value)).ToArray();
        }

        public override async Task<ConditionalValue<object>> TryGetValueAsync(string key)
        {
            var normalizedKey = NormalizeKey(key);
            var redisValue = await _database.StringGetAsync(normalizedKey);
            return CreateConditionalValue(normalizedKey, redisValue);
        }

        public override async Task<ConditionalValue<object>[]> TryGetValuesAsync(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey);
            var redisValues = await _database.StringGetAsync(redisKeys.ToArray());
            return redisValues.Select((value, idx) => CreateConditionalValue(keys[idx], value)).ToArray();
        }

        public override void Set(string key, object value, TimeSpan? slidingExpireTime = null, DateTimeOffset? absoluteExpireTime = null)
        {
            if (value == null)
            {
                throw new AbpException("Can not insert null values to the cache!");
            }

            var redisKey = NormalizeKey(key);
            var redisValue = Serialize(value, GetSerializableType(value));
            if (absoluteExpireTime.HasValue)
            {
                if (!_database.StringSet(redisKey, redisValue))
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
                if (!_database.StringSet(redisKey, redisValue, slidingExpireTime.Value))
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", redisKey, redisValue, slidingExpireTime.Value);
                }
            }
            else if (DefaultAbsoluteExpireTimeFactory != null)
            {
                if (!_database.StringSet(redisKey, redisValue))
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
                if (!_database.StringSet(redisKey, redisValue))
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
                if (!_database.StringSet(redisKey, redisValue, DefaultSlidingExpireTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} in Redis", redisKey, redisValue, DefaultSlidingExpireTime);
                }
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
            if (absoluteExpireTime.HasValue)
            {
                if (!await _database.StringSetAsync(redisKey, redisValue))
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
                if (!await _database.StringSetAsync(redisKey, redisValue, slidingExpireTime.Value))
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", redisKey, redisValue, slidingExpireTime.Value);
                }
            }
            else if (DefaultAbsoluteExpireTimeFactory != null)
            {
                if (!await _database.StringSetAsync(redisKey, redisValue))
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
                if (!await _database.StringSetAsync(redisKey, redisValue))
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
                if (!await _database.StringSetAsync(redisKey, redisValue, DefaultSlidingExpireTime))
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} to expire after {2:c} asynchronously in Redis", redisKey, redisValue, DefaultSlidingExpireTime);
                }
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
            });

            if (!await _database.StringSetAsync(redisPairs.ToArray()))
            {
                foreach (var pair in redisPairs)
                {
                    Logger.ErrorFormat("Unable to set key:{0} value:{1} asynchronously in Redis", pair.Key, pair.Value);
                }
            }
            else
            {
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
            _database.KeyDelete(NormalizeKey(key));
        }

        public override async Task RemoveAsync(string key)
        {
            await _database.KeyDeleteAsync(NormalizeKey(key));
        }

        public override void Remove(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey);
            _database.KeyDelete(redisKeys.ToArray());
        }

        public override async Task RemoveAsync(string[] keys)
        {
            var redisKeys = keys.Select(NormalizeKey);
            await _database.KeyDeleteAsync(redisKeys.ToArray());
        }

        public override void Clear()
        {
            ClearRedisCacheInternal();
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

        protected ConditionalValue<object> CreateConditionalValue(RedisKey key, RedisValue redisValue)
        {
            if (!redisValue.HasValue)
                return new ConditionalValue<object>(false, null!);

            try
            {
                var deserialized = Deserialize(redisValue);
                return new ConditionalValue<object>(true, deserialized);
            }
            catch (Exception ex) when (ex is JsonException || ex is SerializationException || ex is FileNotFoundException)
            {
                SafeDeleteKey(key);

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
