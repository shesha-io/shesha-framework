using System.Collections.Generic;
using System.Linq;
using NUglify.Helpers;
using Shesha.Domain;

namespace Shesha.ShaRoles.Dto
{
    public static class ShaRoleDtoExtensions
    {
        public static List<ShaRolePermission> MapPermissions(this ShaRole role, IEnumerable<string> permissions)
        {
            var roles = role.Permissions.ToList();
            permissions.Where(x => !roles.Any(p => p.Permission == x && p.IsGranted)).ForEach(x =>
            {
                roles.Add(new ShaRolePermission() { Permission = x, IsGranted = true, ShaRole = role });
            });

            roles.Where(x => permissions.All(p => x.Permission != p)).ToList().ForEach(x =>
            {
                roles.Remove(x);
            });

            return roles;
        }
    }
}