using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Authorization.Dtos;
using Shesha.Cache;

namespace Shesha.Authorization.Cache
{

    public class CustomUserPermissionCacheHolder : CacheHolder<string, CustomUserPermissionCacheItem>, ICustomUserPermissionCacheHolder, ISingletonDependency
    {
        public CustomUserPermissionCacheHolder(ICacheManager cacheManager) : base(CustomUserPermissionCacheItem.CacheStoreName, cacheManager)
        {
        }
    }
}
