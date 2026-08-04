using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Microsoft.Extensions.Configuration;
using Shesha.Cache;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Cache
{
    public class FormCacheHolder : CacheHolder<string, FormConfigurationDto>, IFormCacheHolder, ISingletonDependency, IAsyncEventHandler<EntityChangedEventData<FormConfiguration>>
    {
        private readonly IAppKeysStore _appKeyStore;

        public bool IsEnabled { get; set; }

        public FormCacheHolder(ICacheManager cacheManager, IConfiguration configuration, IAppKeysStore appKeyStore) : base("FormsCache", cacheManager)
        {
            _appKeyStore = appKeyStore;

            IsEnabled = !configuration.GetValue<bool>("disableFormsCache");

            var expiration = configuration.GetValue<int?>("FormsCacheExpiration");
            var expirationMins = expiration.HasValue && expiration.Value > 0
                ? expiration.Value
                : 24 * 60;

            Cache.DefaultSlidingExpireTime = TimeSpan.FromMinutes(expirationMins);
        }

        public string GetCacheKey(string module, string applicationKey, string name, ConfigurationItemViewMode mode)
        {
            var key = $"{module}|{name}|{mode}";

            if (!string.IsNullOrWhiteSpace(applicationKey))
                key = applicationKey + "/" + key;

            return key.ToLower();
        }

        public async Task HandleEventAsync(EntityChangedEventData<FormConfiguration> eventData)
        {
            if (!IsEnabled)
                return;

            var form = eventData.Entity;
            if (form == null)
                return;

            var appKeys = _appKeyStore.AppKeys;
            
            var modes = new[] {
                ConfigurationItemViewMode.Live,
                ConfigurationItemViewMode.Ready,
                ConfigurationItemViewMode.Latest
            };
            
            foreach (var mode in modes)
            {
                foreach (var appKey in appKeys)
                    await Cache.RemoveAsync(GetCacheKey(form.Module?.Name, appKey, form.Name, mode));
            }
        }

        public async Task EnableAsync()
        {
            await Cache.ClearAsync();
            IsEnabled = true;            
        }

        public async Task DisableAsync()
        {
            IsEnabled = false;
            await Cache.ClearAsync();
        }
    }
}
