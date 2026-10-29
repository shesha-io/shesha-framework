using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Runtime.Caching;
using System.Collections.Generic;

namespace Shesha.Authorization.Abp
{
    internal static class PermissionExtensions
    {
        internal static bool GetBoolOrDefault(this Dictionary<string, object?>? properties, string name) 
        {
            return properties != null
                && properties.TryGetValue(name, out var value)
                && value != null
                && value is bool boolValue
                && boolValue == true;                
        }

        internal static ITypedCache<string, UserPermissionCacheItem> GetUserPermissionCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<string, UserPermissionCacheItem>(UserPermissionCacheItem.CacheStoreName);
        }

        internal static ITypedCache<string, RolePermissionCacheItem> GetRolePermissionCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<string, RolePermissionCacheItem>(RolePermissionCacheItem.CacheStoreName);
        }
    }
}
