using Abp.Dependency;
using Abp.Domain.Repositories;
using NetTopologySuite.Index.HPRtree;
using Newtonsoft.Json;
using Shesha.Authorization;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.Permissions.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class PermissionDefinitionImport : ConfigurationItemImportBase, IPermissionDefinitionImport, ITransientDependency
    {
        public string ItemType => PermissionDefinition.ItemTypeName;

        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepo;
        private readonly IShaPermissionManager _shaPermissionManager;

        public PermissionDefinitionImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<PermissionDefinition, Guid> permissionDefinitionRepo,
            IShaPermissionManager shaPermissionManager
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _permissionDefinitionRepo = permissionDefinitionRepo;
            _shaPermissionManager = shaPermissionManager;
        }

        public override Task<List<DistributedConfigurableItemBase>> SortItemsAsync(List<DistributedConfigurableItemBase> items)
        {
            var loaclItems = items.Select(x =>
            {
                if (!(x is DistributedPermissionDefinition itemConfig))
                    throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(PermissionDefinition)}. Actual type is {x.GetType().FullName}");
                return itemConfig;
            }).ToList();

            var result = new List<DistributedConfigurableItemBase>();

            var addItems = (string parent) => { };
            addItems = (string parent) =>
            {
                var list = loaclItems.Where(x => x.Parent == parent);
                result.AddRange(list);
                foreach (var item in list)
                {
                    addItems(item.Name);
                }
            };

            addItems(null);

            return Task.FromResult(result);
        }

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedPermissionDefinition itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(PermissionDefinition)}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportAsync(DistributedPermissionDefinition item, IConfigurationItemsImportContext context) 
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            // get DB config
            var dbItem = await _permissionDefinitionRepo.FirstOrDefaultAsync(x =>
                x.Name == item.Name
                && (x.Module == null && item.ModuleName == null || x.Module.Name == item.ModuleName)
                && x.IsLast);

            if (dbItem != null)
            {

                // ToDo: Temporary update the current version.
                // Need to update the rest of the other code to work with versioning first

                await MapConfigAync(item, dbItem, context);
                await _shaPermissionManager.EditPermissionAsync(dbItem.Name, dbItem);
                await _permissionDefinitionRepo.UpdateAsync(dbItem);

                return dbItem;
            }
            else
            {
                var newItem = new PermissionDefinition();
                await MapConfigAync(item, newItem, context);

                // fill audit?
                newItem.VersionNo = 1;
                newItem.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newItem.VersionStatus = statusToImport;
                newItem.CreatedByImport = context.ImportResult;

                newItem.Normalize();
                await _shaPermissionManager.CreatePermissionAsync(newItem);
                await _permissionDefinitionRepo.InsertAsync(newItem);

                return newItem;
            }
        }

        protected async Task<PermissionDefinition> MapConfigAync(DistributedPermissionDefinition item, PermissionDefinition dbItem, IConfigurationItemsImportContext context)
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
            dbItem.Parent = item.Parent;
            return dbItem;
        }

        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedPermissionDefinition>(json);
            }
        }
    }
}
