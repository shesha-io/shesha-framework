using Shesha.Domain;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ShaRoles.Dto
{
    public static class ShaRoleDtoExtensions
    {
        public static List<ShaRolePermission> MapPermissions(this ShaRole role, IEnumerable<string> permissions)
        {
            var rolesPermissions = role.Permissions.ToList();
            var toAdd = permissions.Where(x => !rolesPermissions.Any(p => p.Permission == x && p.IsGranted));
            foreach (var permission in toAdd) 
                rolesPermissions.Add(new ShaRolePermission() { Permission = permission, IsGranted = true, Role = role });

            var toRemove = rolesPermissions.Where(x => permissions.All(p => x.Permission != p)).ToList();
            foreach (var permission in toRemove)
                rolesPermissions.Remove(permission);

            return rolesPermissions;
        }
    }
}