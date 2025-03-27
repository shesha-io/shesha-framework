using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;

namespace Shesha.DynamicEntities.Cache
{
    public class FullProxyCacheHolder : CacheHolder<string, DynamicDtoProxyCacheItem>, IFullProxyCacheHolder, ISingletonDependency
    {
        public FullProxyCacheHolder(ICacheManager cacheManager) : base("FullProxyCache", cacheManager)
        {
        }
    }
}
