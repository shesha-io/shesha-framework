using Abp.Dependency;
using Abp.Runtime.Caching;
using Microsoft.Extensions.Configuration;
using Shesha.Cache;
using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.DynamicEntities.Cache
{
    public class ModelConfigsCacheHolder : CacheHolder<string, ModelConfigurationDto>, IModelConfigsCacheHolder, ISingletonDependency
    {
        public ModelConfigsCacheHolder(ICacheManager cacheManager, IConfiguration configuration) : base("ModelConfigsCache", cacheManager)
        {
            var expiration = configuration.GetValue<int?>("ModelConfigsCacheExpiration");
            var expirationMins = expiration.HasValue && expiration.Value > 0
                ? expiration.Value
                : 24 * 60;

            Cache.DefaultSlidingExpireTime = TimeSpan.FromMinutes(expirationMins);
        }
    }
}
