using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ShaRoles.Dto
{
    public static class ShaRoleDtoExtensions
    {
        public static List<ShaRolePermission> MapPermissions(this ShaRole role, IEnumerable<string> permissions)
        {
            var rolePermissionRepository = StaticContext.IocManager.Resolve<IRepository<ShaRolePermission, Guid>>();
            var rolesPermissions = role.Permissions.ToList();
            
            var toAdd = permissions.Where(x => !rolesPermissions.Any(p => p.Permission == x && p.IsGranted)).ToList();
            foreach (var permission in toAdd) 
            {
                var rolePermission = new ShaRolePermission() { 
                    Permission = permission, 
                    IsGranted = true,
                    Role = role 
                };
                rolePermissionRepository.Insert(rolePermission);
                rolesPermissions.Add(rolePermission);
            }                

            var toRemove = rolesPermissions.Where(x => permissions.All(p => x.Permission != p)).ToList();
            foreach (var permission in toRemove) 
            {
                rolePermissionRepository.Delete(permission);
                rolesPermissions.Remove(permission);
            }

            return rolesPermissions;
        }
    }
}