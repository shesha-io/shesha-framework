using Abp.Dependency;
using Castle.Core.Logging;
using StackExchange.Redis;
using System.Collections.Concurrent;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Redis pub/sub implementation of <see cref="IShaCacheInvalidationBus"/>.
    ///
    /// One channel carries invalidations for every named cache; the payload identifies the cache
    /// and key. Messages are tagged with a per-process <see cref="NodeId"/> so an instance ignores
    /// its own broadcasts — it has already invalidated locally by the time it publishes.
    ///
    /// Failures here are logged and swallowed: a lost invalidation degrades coherence to the L1
    /// TTL, which is bounded, whereas throwing would fail the cache write that triggered it.
    /// </summary>
    public class ShaCacheInvalidationBus : IShaCacheInvalidationBus, ISingletonDependency, IDisposable
    {
        private const char Separator = '|';

        private readonly IShaRedisCacheDatabaseProvider _databaseProvider;
        private readonly ShaRedisCacheOptions _options;
        private readonly ConcurrentDictionary<string, Action<string>> _handlers = new();

        private ISubscriber? _subscriber;
        private bool _subscribed;
        private bool _disposed;
        private readonly object _subscribeLock = new();

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public string NodeId { get; } = Guid.NewGuid().ToString("N");

        public bool IsConnected => _subscribed;

        /// <summary>Channel name, namespaced by the configured key prefix.</summary>
        private RedisChannel Channel =>
            RedisChannel.Literal($"{_options.KeyPrefix}sha:cache:invalidation");

        public ShaCacheInvalidationBus(
            IShaRedisCacheDatabaseProvider databaseProvider,
            ShaRedisCacheOptions options)
        {
            _databaseProvider = databaseProvider;
            _options = options;
        }

        public void Subscribe(string cacheName, Action<string> onInvalidated)
        {
            _handlers[cacheName] = onInvalidated;
            EnsureSubscribed();
        }

        public void Publish(string cacheName, string normalizedKey)
        {
            if (!_options.L1InvalidationBroadcastEnabled)
                return;

            try
            {
                GetSubscriber()?.Publish(Channel, Format(cacheName, normalizedKey));
            }
            catch (Exception ex)
            {
                // Coherence degrades to the L1 TTL rather than failing the write.
                Logger.Warn($"Failed to publish cache invalidation for {cacheName}/{normalizedKey}", ex);
            }
        }

        public async Task PublishAsync(string cacheName, string normalizedKey)
        {
            if (!_options.L1InvalidationBroadcastEnabled)
                return;

            try
            {
                var subscriber = GetSubscriber();
                if (subscriber != null)
                    await subscriber.PublishAsync(Channel, Format(cacheName, normalizedKey));
            }
            catch (Exception ex)
            {
                Logger.Warn($"Failed to publish cache invalidation for {cacheName}/{normalizedKey}", ex);
            }
        }

        private string Format(string cacheName, string normalizedKey) =>
            $"{NodeId}{Separator}{cacheName}{Separator}{normalizedKey}";

        private ISubscriber? GetSubscriber()
        {
            if (_disposed)
                return null;

            try
            {
                return _subscriber ??= _databaseProvider.GetSubscriber();
            }
            catch (Exception ex)
            {
                Logger.Warn("Redis subscriber unavailable; L1 coherence falls back to expiry only.", ex);
                return null;
            }
        }

        private void EnsureSubscribed()
        {
            if (_subscribed || _disposed || !_options.L1InvalidationBroadcastEnabled)
                return;

            lock (_subscribeLock)
            {
                if (_subscribed || _disposed)
                    return;

                var subscriber = GetSubscriber();
                if (subscriber == null)
                    return;

                try
                {
                    subscriber.Subscribe(Channel, OnMessage);
                    _subscribed = true;
                }
                catch (Exception ex)
                {
                    Logger.Warn("Failed to subscribe to the cache invalidation channel; " +
                                "L1 coherence falls back to expiry only.", ex);
                }
            }
        }

        private void OnMessage(RedisChannel channel, RedisValue message)
        {
            try
            {
                var text = (string?)message;
                if (string.IsNullOrEmpty(text))
                    return;

                // nodeId | cacheName | normalizedKey  -- the key itself may contain separators,
                // so split into at most three parts.
                var parts = text.Split(Separator, 3);
                if (parts.Length != 3)
                    return;

                // Our own broadcast: the local L1 was already updated before publishing.
                if (parts[0] == NodeId)
                    return;

                if (_handlers.TryGetValue(parts[1], out var handler))
                    handler(parts[2]);
            }
            catch (Exception ex)
            {
                // A bad message must never take down the subscriber for every other cache.
                Logger.Warn("Failed to process a cache invalidation message.", ex);
            }
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            try
            {
                if (_subscribed)
                    _subscriber?.Unsubscribe(Channel);
            }
            catch
            {
                // Shutdown path: the connection may already be gone.
            }

            _handlers.Clear();
        }
    }
}
