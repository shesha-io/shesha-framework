using System.Threading.Tasks;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Roles.Dto;

namespace Shesha.Permissions
{
    public static class SheshaPermissionsExtension
    {
        public static async Task<Abp.Authorization.Permission> CreatePermissionAsync(this IShaPermissionManager permissionManager, PermissionDto permission)
        {
            var dbp = new PermissionDefinition()
            {
                Name = permission.Name,
                DisplayName = permission.DisplayName,
                Description = permission.Description,
                Parent = permission.ParentName ?? permission.Parent?.Name
            };

            return await permissionManager.CreatePermissionAsync(dbp);
        }

        public static async Task<Abp.Authorization.Permission> EditPermissionAsync(this IShaPermissionManager permissionManager, PermissionDto permission)
        {
            var dbp = new PermissionDefinition()
            {
                Name = permission.Name,
                DisplayName = permission.DisplayName,
                Description = permission.Description,
                Parent = permission.ParentName ?? permission.Parent?.Name
            };

            return await permissionManager.EditPermissionAsync(permission.Id, dbp);
        }

    }
}