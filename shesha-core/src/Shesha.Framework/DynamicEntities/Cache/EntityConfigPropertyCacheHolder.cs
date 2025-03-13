using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;

namespace Shesha.DynamicEntities.Cache
{
    public class EntityConfigPropertyCacheHolder : CacheHolder<string, EntityConfigCacheItem?>, IEntityConfigPropertyCacheHolder, ISingletonDependency
    {
        public EntityConfigPropertyCacheHolder(ICacheManager cacheManager) : base("EntityConfigPropertyCache", cacheManager)
        {
        }
    }
}