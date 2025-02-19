using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System.Collections.Generic;

namespace Shesha.QuickSearch.Cache
{
    public class QuickSearchPropertiesCacheHolder : CacheHolder<string, List<QuickSearchPropertyInfo>>, IQuickSearchPropertiesCacheHolder, ISingletonDependency
    {
        public QuickSearchPropertiesCacheHolder(ICacheManager cacheManager) : base("QuickSearchPropertiesCache", cacheManager)
        {
        }
    }
}
