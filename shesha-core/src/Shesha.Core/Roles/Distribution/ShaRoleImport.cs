using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Roles.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleImport : ConfigurationItemImportBase<ShaRole, DistributedShaRole>, IShaRoleImport, ITransientDependency
    {
        private readonly IRepository<ShaRolePermission, Guid> _rolePermissionRepo;
        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<ShaRole, Guid> repository,
            IRepository<ShaRolePermission, Guid> rolePermissionRepo
        ) : base (repository, moduleRepo, frontEndAppRepo)
        {
            _rolePermissionRepo = rolePermissionRepo;
        }

        private async Task ImportPermissionsAsync(ShaRole item, DistributedShaRole distributedItem) 
        {
            var dbPermissions = await _rolePermissionRepo.GetAll().Where(e => e.Role == item).ToListAsync();

            var toDelete = dbPermissions.Where(e => !distributedItem.Permissions.Any(dp => dp.Permission == e.Permission)).ToList();
            foreach (var permission in toDelete) 
            {
                await _rolePermissionRepo.DeleteAsync(permission);
            }

            foreach (var perm in distributedItem.Permissions)
            {
                var dbPermission = dbPermissions.FirstOrDefault(e => e.Permission == perm.Permission);
                if (dbPermission != null)
                {
                    dbPermission.IsGranted = perm.IsGranted;
                    await _rolePermissionRepo.UpdateAsync(dbPermission);
                }
                else {
                    await _rolePermissionRepo.InsertAsync(new ShaRolePermission()
                    {
                        Role = item,
                        Permission = perm.Permission,
                        IsGranted = perm.IsGranted,
                    });
                }                    
            }
        }

        protected override async Task<bool> CustomPropsAreEqualAsync(ShaRole item, DistributedShaRole distributedItem)
        {
            var equals = item.NameSpace == distributedItem.NameSpace &&
                item.HardLinkToApplication == distributedItem.HardLinkToApplication;

            if (!equals)
                return false;

            return await PermissionsAreEqualAsync(item, distributedItem);
        }

        private async Task<bool> PermissionsAreEqualAsync(ShaRole role, DistributedShaRole distributedItem)
        {
            var dbPermissions = await _rolePermissionRepo.GetAll().Where(e => e.Role == role && e.IsGranted)
                .OrderBy(e => e.Permission)
                .Select(e => e.Permission)                
                .ToListAsync();

            var distributedPermissions = distributedItem.Permissions
                .Where(e => e.IsGranted)
                .OrderBy(e => e.Permission)
                .Select(e => e.Permission)                
                .ToList();

            return dbPermissions.Delimited(",") == distributedPermissions.Delimited(",");
        }

        protected override async Task MapCustomPropsToItemAsync(ShaRole item, DistributedShaRole distributedItem)
        {
            item.NameSpace = distributedItem.NameSpace;
            item.SetHardLinkToApplication(distributedItem.HardLinkToApplication);

            await ImportPermissionsAsync(item, distributedItem);
        }
    }
}