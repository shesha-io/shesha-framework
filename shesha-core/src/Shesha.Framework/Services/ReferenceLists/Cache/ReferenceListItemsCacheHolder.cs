using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using Shesha.Services.ReferenceLists.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Cache
{
    public class ReferenceListItemsCacheHolder : CacheHolder<Guid, List<ReferenceListItemDto>>, IReferenceListItemsCacheHolder, ISingletonDependency
    {
        public ReferenceListItemsCacheHolder(ICacheManager cacheManager) : base("ReferenceListItemsCache", cacheManager)
        {
        }
    }
}
