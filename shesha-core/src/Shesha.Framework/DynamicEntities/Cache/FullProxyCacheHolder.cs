using Abp.Dependency;
using Abp.Runtime.Caching.Memory;
using Shesha.Cache;

namespace Shesha.DynamicEntities.Cache
{
    public class FullProxyCacheHolder : CacheHolder<string, DynamicDtoProxyCacheItem>, IFullProxyCacheHolder, ISingletonDependency
    {
        public FullProxyCacheHolder(AbpMemoryCacheManager cacheManager) : base("FullProxyCache", cacheManager)
        {
        }
    }
}
