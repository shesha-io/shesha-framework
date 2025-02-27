using Shesha.Cache;
using System.Collections.Generic;

namespace Shesha.QuickSearch.Cache
{
    public interface IQuickSearchPropertiesCacheHolder : ICacheHolder<string, List<QuickSearchPropertyInfo>>
    {
    }
}
