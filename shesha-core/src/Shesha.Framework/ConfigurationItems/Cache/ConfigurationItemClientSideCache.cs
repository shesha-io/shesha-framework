using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Cache
{
    /// inhertiedDoc
    public sealed class ConfigurationItemClientSideCache : IConfigurationItemClientSideCache, IAsyncEventHandler<EntityChangedEventData<ConfigurationItem>>, IAsyncEventHandler<EntityChangedEventData<ConfigurationItemRevision>>, ISingletonDependency, IDisposable
    {
        private readonly ICacheManager _cacheManager;
        private bool _disposed;
        private readonly Dictionary<string, ITypedCache<string, ConfigurationItemCacheItem>> _caches;
        private string CachePrefix => $"{this.GetType().Name}:";

        public ConfigurationItemClientSideCache(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
            _caches = new Dictionary<string, ITypedCache<string, ConfigurationItemCacheItem>>();
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            foreach (var cache in _caches.Values)
                cache.Dispose();
        }

        private ITypedCache<string, ConfigurationItemCacheItem> GetCache(string itemType)
        {
            if (!_caches.TryGetValue(itemType, out var cache))
            {
                cache = _cacheManager.GetCache<string, ConfigurationItemCacheItem>(CachePrefix + itemType);
                _caches[itemType] = cache;
                return cache;
            }
            else
                return cache;
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP001:Dispose created", Justification = "Caches are disposed as part of main Dispose() mathod")]
        private Task<TResult> UsingCacheAsync<TResult>(string itemType, Func<ITypedCache<string, ConfigurationItemCacheItem>, Task<TResult>> actionAsync) 
        {
            var cache = GetCache(itemType);
            return actionAsync.Invoke(cache);
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP001:Dispose created", Justification = "Caches are disposed as part of main Dispose() mathod")]
        private Task UsingCacheAsync(string itemType, Func<ITypedCache<string, ConfigurationItemCacheItem>, Task> actionAsync)
        {
            var cache = GetCache(itemType);
            return actionAsync.Invoke(cache);
        }

        /// inhertiedDoc
        public Task<string?> GetCachedMd5Async(string itemType, string? applicationKey, string? module, string name)
        {
            var key = GetCacheKey(applicationKey, module, name);

            return UsingCacheAsync(itemType, async(cache) => {
                var value = await cache.TryGetValueAsync(key);
                return value.HasValue ? value.Value.Md5 : null;
            });
        }
        
        /// inhertiedDoc
        public Task<string?> GetCachedMd5Async(string itemType, Guid id)
        {
            var key = GetCacheKey(id);

            return UsingCacheAsync(itemType, async (cache) => {
                var value = await cache.TryGetValueAsync(key);
                return value.HasValue ? value.Value.Md5 : null;
            });
        }

        /// inhertiedDoc
        public Task SetCachedMd5Async(string itemType, string? applicationKey, string? module, string name, string? md5)
        {
            var key = GetCacheKey(applicationKey, module, name);
            return UsingCacheAsync(itemType, async (cache) => {
                await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
            });
        }

        /// inhertiedDoc
        public Task SetCachedMd5Async(string itemType, Guid id, string md5)
        {
            var key = GetCacheKey(id);
            return UsingCacheAsync(itemType, async (cache) => {
                await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
            });
        }

        private string GetCacheKey(string? applicationKey, string? module, string name)
        {
            var key = $"{module}|{name}";

            if (!string.IsNullOrWhiteSpace(applicationKey))
                key = applicationKey + "/" + key;
            
            return key.ToLower(); 
        }
        private string GetCacheKey(Guid id)
        {
            return id.ToString();
        }

        public async Task ClearAsync()
        {
            var caches = _cacheManager.GetAllCaches();
            foreach (var cache in caches) 
            {
                if (cache.Name.StartsWith(CachePrefix))
                    await cache.ClearAsync();
            }
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }

        public async Task HandleEventAsync(EntityChangedEventData<ConfigurationItemRevision> eventData)
        {
            var configItem = eventData.Entity?.ConfigurationItem;

            if (configItem == null || string.IsNullOrWhiteSpace(configItem.ItemType))
                return;

            await ClearCacheForItemAsync(configItem);
        }

        public async Task HandleEventAsync(EntityChangedEventData<ConfigurationItem> eventData)
        {
            var configItem = eventData.Entity;

            if (configItem == null || string.IsNullOrWhiteSpace(configItem.ItemType))
                return;

            await ClearCacheForItemAsync(configItem);
        }

        public async Task ClearCacheForItemAsync(ConfigurationItem configItem) 
        {
            await UsingCacheAsync(configItem.ItemType, async (cache) => {
                await cache.RemoveAsync(GetCacheKey(configItem.Id));
                await cache.RemoveAsync(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name));
            });
        }
    }
}
