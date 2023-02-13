using System.Collections.Generic;
using ConcurrentCollections;

namespace Shesha.Authorization.Dtos
{
    public class CustomUserPermissionCacheItem
    {
        public const string CacheStoreName = "CustomUserPermissionsCache";
        public long UserId { get; set; }

        /// <summary>
        /// Changed from HashSet to ConcurrentHashSet because of the `Operations that change non-concurrent collections must have exclusive access` exception in `HashSet`1.Contains`
        /// </summary>
        public ConcurrentHashSet<string> GrantedPermissions { get; set; }

        /// <summary>
        /// Changed from HashSet to ConcurrentHashSet because of the `Operations that change non-concurrent collections must have exclusive access` exception in `HashSet`1.Contains`
        /// </summary>
        public ConcurrentHashSet<string> ProhibitedPermissions { get; set; }

        public CustomUserPermissionCacheItem()
        {
            GrantedPermissions = new ConcurrentHashSet<string>();
            ProhibitedPermissions = new ConcurrentHashSet<string>();
        }

        public CustomUserPermissionCacheItem(long userId)
            : this()
        {
            UserId = userId;
        }
    }
}
