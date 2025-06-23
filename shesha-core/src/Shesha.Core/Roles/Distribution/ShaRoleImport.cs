using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Roles.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleImport : ConfigurationItemImportBase<ShaRole, DistributedShaRole>, IShaRoleImport, ITransientDependency
    {
        private readonly IRepository<ShaRole, Guid> _roleRepo;
        private readonly IRepository<ShaRolePermission, Guid> _rolePermissionRepo;
        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<ShaRole, Guid> roleRepo,
            IRepository<ShaRolePermission, Guid> rolePermissionRepo
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _rolePermissionRepo = rolePermissionRepo;
            _roleRepo = roleRepo;
        }

        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedShaRole itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(ShaRole)}. Actual type is {item.GetType().FullName}");

            return ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItem> ImportAsync(DistributedShaRole item, IConfigurationItemsImportContext context) 
        {
            // get DB config
            var dbItem = await _roleRepo.FirstOrDefaultAsync(x =>
                x.Name == item.Name
                && (x.Module == null && item.ModuleName == null || x.Module != null && x.Module.Name == item.ModuleName)
            );

            if (dbItem != null)
            {
                await MapConfigAsync(item, dbItem, context);
                await _roleRepo.UpdateAsync(dbItem);

                // TODO: V1 review
                //await _rolePermissionRepo.DeleteAsync(x => x.ShaRole.Id == dbItem.Id);
            }
            else
            {
                dbItem = new ShaRole();
                await MapConfigAsync(item, dbItem, context);

                dbItem.Module = await GetModuleAsync(item.ModuleName, context);

                // TODO: V1 review
                //dbItem.CreatedByImport = context.ImportResult;

                dbItem.Normalize();
                await _roleRepo.InsertAsync(dbItem);
            }

            var revision = dbItem.EnsureLatestRevision();
            foreach (var perm in item.Permissions)
            {
                await _rolePermissionRepo.InsertAsync(new ShaRolePermission()
                {
                    RoleRevision = revision,
                    Permission = perm.Permission,
                    IsGranted = perm.IsGranted,
                });
            }

            return dbItem;
        }

        protected async Task<ShaRole> MapConfigAsync(DistributedShaRole item, ShaRole dbItem, IConfigurationItemsImportContext context)
        {
            dbItem.Name = item.Name;
            dbItem.Module = await GetModuleAsync(item.ModuleName, context);
            dbItem.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);
            dbItem.ItemType = item.ItemType;

            var revision = dbItem.EnsureLatestRevision();
            revision.Label = item.Label;
            revision.Description = item.Description;
            dbItem.Suppress = item.Suppress;

            // entity config specific properties
            revision.NameSpace = item.NameSpace;
            revision.SetHardLinkToApplication(item.HardLinkToApplication);

            return dbItem;
        }
    }
}