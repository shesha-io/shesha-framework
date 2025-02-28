using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System;

namespace Shesha.Permissions.Cache
{
    public class PermissionedObjectsCacheHolder : CacheHolder<string, CacheItemWrapper<PermissionedObjectDto>>, IPermissionedObjectsCacheHolder, ISingletonDependency
    {
        public PermissionedObjectsCacheHolder(ICacheManager cacheManager) : base(PermissionedObjectDto.CacheStoreName, cacheManager)
        {
            Cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
        }
    }
}
