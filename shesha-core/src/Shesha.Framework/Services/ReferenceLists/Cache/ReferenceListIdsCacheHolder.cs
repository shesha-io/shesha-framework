using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System;

namespace Shesha.Services.ReferenceLists.Cache
{
    public class ReferenceListIdsCacheHolder : CacheHolder<string, Guid>, IReferenceListIdsCacheHolder, ISingletonDependency
    {
        public ReferenceListIdsCacheHolder(ICacheManager cacheManager) : base("ReferenceListIdsCache", cacheManager)
        {
        }
    }
}
