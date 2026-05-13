using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Microsoft.Extensions.Configuration;
using Shesha.Cache;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Cache
{
    public class FormCacheHolder : CacheHolder<string, FormConfigurationDto>, IFormCacheHolder, ISingletonDependency, IAsyncEventHandler<EntityChangedEventData<FormConfiguration>>
    {
        public bool IsEnabled { get; set; }

        public FormCacheHolder(ICacheManager cacheManager, IConfiguration configuration) : base("FormsCache", cacheManager)
        {
            IsEnabled = !configuration.GetValue<bool>("disableFormsCache");

            var expiration = configuration.GetValue<int?>("FormsCacheExpiration");
            var expirationMins = expiration.HasValue && expiration.Value > 0
                ? expiration.Value
                : 24 * 60;

            Cache.DefaultSlidingExpireTime = TimeSpan.FromMinutes(expirationMins);
        }

        public string GetCacheKey(string module, string name, ConfigurationItemViewMode mode)
        {
            return $"{module}/{name}:{mode}".ToLower();
        }

        public async Task HandleEventAsync(EntityChangedEventData<FormConfiguration> eventData)
        {
            if (!IsEnabled)
                return;

            var form = eventData.Entity;
            if (form == null)
                return;

            await Cache.RemoveAsync(GetCacheKey(form.Module?.Name, form.Name, ConfigurationItemViewMode.Live));
            await Cache.RemoveAsync(GetCacheKey(form.Module?.Name, form.Name, ConfigurationItemViewMode.Ready));
            await Cache.RemoveAsync(GetCacheKey(form.Module?.Name, form.Name, ConfigurationItemViewMode.Latest));
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
