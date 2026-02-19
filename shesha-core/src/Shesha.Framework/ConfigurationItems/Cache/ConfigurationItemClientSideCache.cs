using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Cache
{
    /// inhertiedDoc
    public sealed class ConfigurationItemClientSideCache : IConfigurationItemClientSideCache, IAsyncEventHandler<EntityChangedEventData<ConfigurationItemBase>> , ISingletonDependency, IDisposable
    {
        private readonly ICacheManager _cacheManager;
        private bool _disposed;
        private readonly ConcurrentDictionary<string, ITypedCache<string, ConfigurationItemCacheItem>> _caches;
        private string CachePrefix => $"{this.GetType().Name}:";

        public ConfigurationItemClientSideCache(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
            _caches = new ConcurrentDictionary<string, ITypedCache<string, ConfigurationItemCacheItem>>();
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
        private async Task<TResult> UsingCacheAsync<TResult>(string itemType, Func<ITypedCache<string, ConfigurationItemCacheItem>, Task<TResult>> actionAsync) 
        {
            var cache = GetCache(itemType);
            return await actionAsync.Invoke(cache);
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP001:Dispose created", Justification = "Caches are disposed as part of main Dispose() mathod")]
        private async Task UsingCacheAsync(string itemType, Func<ITypedCache<string, ConfigurationItemCacheItem>, Task> actionAsync)
        {
            var cache = GetCache(itemType);
            await actionAsync.Invoke(cache);
        }

        /// inhertiedDoc
        public async Task<string> GetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode)
        {
            var key = GetCacheKey(applicationKey, module, name, mode);

            return await UsingCacheAsync(itemType, async(cache) => {
                var value = await cache.TryGetValueAsync(key);
                return value.HasValue ? value.Value.Md5 : null;
            });
        }
        
        /// inhertiedDoc
        public async Task<string> GetCachedMd5Async(string itemType, Guid id)
        {
            var key = GetCacheKey(id);

            return await UsingCacheAsync(itemType, async (cache) => {
                var value = await cache.TryGetValueAsync(key);
                return value.HasValue ? value.Value.Md5 : null;
            });
        }

        /// inhertiedDoc
        public async Task SetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode, string md5)
        {
            var key = GetCacheKey(applicationKey, module, name, mode);
            await UsingCacheAsync(itemType, async (cache) => {
                await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
            });
        }

        /// inhertiedDoc
        public async Task SetCachedMd5Async(string itemType, Guid id, string md5)
        {
            var key = GetCacheKey(id);
            await UsingCacheAsync(itemType, async (cache) => {
                await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
            });
        }

        private string GetCacheKey(string applicationKey, string module, string name, ConfigurationItemViewMode mode)
        {
            var key = $"{module}|{name}|{mode}";

            if (!string.IsNullOrWhiteSpace(applicationKey))
                key = applicationKey + "/" + key;
            
            return key.ToLower(); 
        }
        private string GetCacheKey(Guid id)
        {
            return id.ToString();
        }

        public async Task HandleEventAsync(EntityChangedEventData<ConfigurationItemBase> eventData)
        {
            var configItem = eventData.Entity;

            if (configItem == null || string.IsNullOrWhiteSpace(configItem.ItemType))
                return;

            await UsingCacheAsync(configItem.ItemType, async (cache) => {
                await cache.RemoveAsync(GetCacheKey(configItem.Id));
                await cache.RemoveAsync(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Live));
                await cache.RemoveAsync(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Ready));
                await cache.RemoveAsync(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Latest));
            });
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
    }
}
