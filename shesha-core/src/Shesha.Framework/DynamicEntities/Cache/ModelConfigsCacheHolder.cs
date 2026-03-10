using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using Shesha.DynamicEntities.Dtos;

namespace Shesha.DynamicEntities.Cache
{
    public class ModelConfigsCacheHolder : CacheHolder<string, ModelConfigurationDto?>, IModelConfigsCacheHolder, ISingletonDependency
    {
        public ModelConfigsCacheHolder(ICacheManager cacheManager) : base("ModelConfigsCache", cacheManager)
        {
        }

        public string GetCacheKey(string? @namespace, string className)
        {
            return $"{@namespace}|{className}";
        }
    }
}
