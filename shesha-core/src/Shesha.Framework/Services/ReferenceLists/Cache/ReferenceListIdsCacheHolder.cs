using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System;
using static Shesha.Services.ReferenceListHelper;

namespace Shesha.Services.ReferenceLists.Cache
{
    public class ReferenceListIdsCacheHolder : CacheHolder<string, RefListRevisionIds>, IReferenceListIdsCacheHolder, ISingletonDependency
    {
        public ReferenceListIdsCacheHolder(ICacheManager cacheManager) : base("ReferenceListIdsCache", cacheManager)
        {
        }
    }
}
