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

        /// <summary>
        /// Independent copy, for callers that need to record a newly evaluated permission without
        /// touching the instance held in the cache. The cache hands out shared references, so
        /// adding to the collections of a value read from it would publish the result to every
        /// other caller before -- or even instead of -- the cache write that is supposed to
        /// commit it.
        /// </summary>
        public CustomUserPermissionCacheItem Copy()
        {
            var copy = new CustomUserPermissionCacheItem(UserId);

            foreach (var permission in GrantedPermissions)
                copy.GrantedPermissions.Add(permission);

            foreach (var permission in ProhibitedPermissions)
                copy.ProhibitedPermissions.Add(permission);

            return copy;
        }
    }
}
