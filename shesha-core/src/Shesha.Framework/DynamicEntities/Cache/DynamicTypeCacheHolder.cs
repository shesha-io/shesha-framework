using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System;

namespace Shesha.DynamicEntities.Cache
{
    public class DynamicTypeCacheHolder : CacheHolder<string, Type>, IDynamicTypeCacheHolder, ISingletonDependency
    {
        public DynamicTypeCacheHolder(ICacheManager cacheManager) : base("DynamicTypeCache", cacheManager)
        {
        }
    }
}
