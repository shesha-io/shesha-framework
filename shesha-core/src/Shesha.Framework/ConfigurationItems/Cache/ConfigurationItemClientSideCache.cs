using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Cache
{
    /// inhertiedDoc
    public class ConfigurationItemClientSideCache : IConfigurationItemClientSideCache, IEventHandler<EntityChangedEventData<ConfigurationItem>> , ISingletonDependency
    {
        private readonly ICacheManager _cacheManager;
        protected string CachePrefix => $"{this.GetType().Name}:";

        public ConfigurationItemClientSideCache(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
        }

        /// inhertiedDoc
        public async Task<string> GetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode)
        {
            var key = GetCacheKey(applicationKey, module, name, mode);
            var cache = GetCache(itemType);
            var value = await cache.TryGetValueAsync(key);
            return value.HasValue ? value.Value.Md5 : null;
        }
        
        /// inhertiedDoc
        public async Task<string> GetCachedMd5Async(string itemType, Guid id)
        {
            var key = GetCacheKey(id);
            var cache = GetCache(itemType);
            var value = await cache.TryGetValueAsync(key);
            return value.HasValue ? value.Value.Md5 : null;
        }

        /// inhertiedDoc
        public async Task SetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode, string md5)
        {
            var key = GetCacheKey(applicationKey, module, name, mode);
            var cache = GetCache(itemType);
            await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
        }

        /// inhertiedDoc
        public async Task SetCachedMd5Async(string itemType, Guid id, string md5)
        {
            var key = GetCacheKey(id);
            var cache = GetCache(itemType);
            await cache.SetAsync(key, new ConfigurationItemCacheItem { Md5 = md5 });
        }

        private ITypedCache<string, ConfigurationItemCacheItem> GetCache(string itemType)
        { 
             return _cacheManager.GetCache<string, ConfigurationItemCacheItem>(CachePrefix + itemType);
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

        public void HandleEvent(EntityChangedEventData<ConfigurationItem> eventData)
        {
            var configItem = eventData.Entity;

            if (configItem == null || string.IsNullOrWhiteSpace(configItem.ItemType))
                return;

            var cache = GetCache(configItem.ItemType);
            cache.Remove(GetCacheKey(configItem.Id));
            cache.Remove(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Live));
            cache.Remove(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Ready));
            cache.Remove(GetCacheKey(configItem.Application?.AppKey, configItem.Module?.Name, configItem.Name, ConfigurationItemViewMode.Latest));
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
    }
}
