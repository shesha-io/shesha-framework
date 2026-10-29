using Abp.MultiTenancy;
using Abp.Runtime.Caching;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using System.Collections.Generic;

namespace Shesha.Authorization
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

        internal static ITypedCache<string, UserPermissionCacheItem?> GetUserPermissionCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<string, UserPermissionCacheItem?>(UserPermissionCacheItem.CacheStoreName);
        }

        internal static ITypedCache<string, RolePermissionCacheItem> GetRolePermissionCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<string, RolePermissionCacheItem>(RolePermissionCacheItem.CacheStoreName);
        }

        public static ITypedCache<int, TenantFeatureCacheItem> GetTenantFeatureCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<int, TenantFeatureCacheItem>(TenantFeatureCacheItem.CacheStoreName);
        }
    }
}
