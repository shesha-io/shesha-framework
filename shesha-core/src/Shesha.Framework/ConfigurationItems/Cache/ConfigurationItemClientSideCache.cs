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
    public sealed class ConfigurationItemClientSideCache : IConfigurationItemClientSideCache, 
        IAsyncEventHandler<EntityChangedEventData<ConfigurationItem>>, 
        ISingletonDependency, 
        IDisposable
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
            var key = GetCacheKey(name);

            return UsingCacheAsync(itemType, async(cache) => {
                var value = await cache.TryGetValueAsync(key);
                var subKey = GetSubKey(applicationKey, module);

                return value.HasValue && value.Value.NestedMd5s.TryGetValue(subKey, out var md5)
                    ? md5
                    : null;
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
            return UsingCacheAsync(itemType, async (cache) => {
                var key = GetCacheKey(name);
                var subKey = GetSubKey(applicationKey, module);
                var cacheItem = await cache.GetOrDefaultAsync(key) ?? new ConfigurationItemCacheItem();

                cacheItem.NestedMd5s[subKey] = md5;

                await cache.SetAsync(key, cacheItem);
            });
        }

        private string GetSubKey(string? applicationKey, string? module) 
        { 
            return string.IsNullOrWhiteSpace(applicationKey) && string.IsNullOrWhiteSpace(module) 
                ? "" 
                : $"{applicationKey}/{module}";
        }

        /// inhertiedDoc
        public Task SetCachedMd5Async(string itemType, Guid id, string md5)
        {
            return UsingCacheAsync(itemType, async (cache) => {
                var key = GetCacheKey(id);
                var cacheItem = await cache.GetOrDefaultAsync(key) ?? new ConfigurationItemCacheItem();

                cacheItem.Md5 = md5;

                await cache.SetAsync(key, cacheItem);
            });
        }

        private string GetCacheKey(ConfigurationItem configItem)
        {
            return GetCacheKey(configItem.Name); 
        }

        private string GetCacheKey(string itemName) 
        {
            return itemName.ToLower();
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
                await cache.RemoveAsync(GetCacheKey(configItem));
            });
        }
    }
}
