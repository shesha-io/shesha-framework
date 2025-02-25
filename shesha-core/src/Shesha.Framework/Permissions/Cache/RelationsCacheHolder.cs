using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System;

namespace Shesha.Permissions.Cache
{
    public class RelationsCacheHolder : CacheHolder<string, PermissionedObjectRelations>, IRelationsCacheHolder, ISingletonDependency
    {
        public RelationsCacheHolder(ICacheManager cacheManager) : base($"Relations-{PermissionedObjectDto.CacheStoreName}", cacheManager)
        {
            Cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
        }
    }
}
