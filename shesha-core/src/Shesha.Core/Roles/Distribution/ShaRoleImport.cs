using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.Authorization;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Permissions.Distribution.Dto;
using Shesha.Roles.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleImport : ConfigurationItemImportBase, IShaRoleImport, ITransientDependency
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

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedShaRole itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(ShaRole)}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportAsync(DistributedShaRole item, IConfigurationItemsImportContext context) 
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            // get DB config
            var dbItem = await _roleRepo.FirstOrDefaultAsync(x =>
                x.Name == item.Name && x.NameSpace == item.NameSpace
                && (x.Module == null && item.ModuleName == null || x.Module.Name == item.ModuleName)
                && x.IsLast);

            if (dbItem != null)
            {

                // ToDo: Temporary update the current version.
                // Need to update the rest of the other code to work with versioning first

                await MapConfigAync(item, dbItem, context);
                await _roleRepo.UpdateAsync(dbItem);

                await _rolePermissionRepo.DeleteAsync(x => x.ShaRole.Id == dbItem.Id);
            }
            else
            {
                dbItem = new ShaRole();
                await MapConfigAync(item, dbItem, context);

                // fill audit?
                dbItem.VersionNo = 1;
                dbItem.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                dbItem.VersionStatus = statusToImport;
                dbItem.CreatedByImport = context.ImportResult;

                dbItem.Normalize();
                await _roleRepo.InsertAsync(dbItem);
            }

            foreach (var perm in item.Permissions)
            {
                await _rolePermissionRepo.InsertAsync(new ShaRolePermission()
                {
                    ShaRole = dbItem,
                    Permission = perm.Permission,
                    IsGranted = perm.IsGranted,
                });
            }

            return dbItem;
        }

        protected async Task<ShaRole> MapConfigAync(DistributedShaRole item, ShaRole dbItem, IConfigurationItemsImportContext context)
        {
            dbItem.Name = item.Name;
            dbItem.Module = await GetModuleAsync(item.ModuleName, context);
            dbItem.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);
            dbItem.ItemType = item.ItemType;

            //dbItem.Origin = item.OriginId;
            //dbItem.BaseItem = item.BaseItem;
            //dbItem.ParentVersion = item.ParentVersionId;

            dbItem.Label = item.Label;
            dbItem.Description = item.Description;
            dbItem.VersionNo = item.VersionNo;
            dbItem.VersionStatus = item.VersionStatus;
            dbItem.Suppress = item.Suppress;

            // entity config specific properties
            dbItem.NameSpace = item.NameSpace;
            dbItem.SortIndex = item.SortIndex;
            dbItem.IsRegionSpecific = item.IsRegionSpecific;
            dbItem.IsProcessConfigurationSpecific = item.IsProcessConfigurationSpecific;
            dbItem.CanAssignToMultiple = item.CanAssignToMultiple;
            dbItem.CanAssignToPerson = item.CanAssignToPerson;
            dbItem.CanAssignToRole = item.CanAssignToRole;
            dbItem.CanAssignToOrganisationRoleLevel = item.CanAssignToOrganisationRoleLevel;
            dbItem.CanAssignToUnit = item.CanAssignToUnit;

            dbItem.SetHardLinkToApplication(item.HardLinkToApplication);

            return dbItem;
        }

        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedShaRole>(json);
            }
        }
    }
}
