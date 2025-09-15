using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Authorization;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class PermissionDefinitionImport : ConfigurationItemImportBase<PermissionDefinition, DistributedPermissionDefinition>, IPermissionDefinitionImport, ITransientDependency
    {
        public string ItemType => PermissionDefinition.ItemTypeName;

        private readonly IShaPermissionManager _shaPermissionManager;

        public PermissionDefinitionImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<PermissionDefinition, Guid> repository,
            IShaPermissionManager shaPermissionManager
        ) : base (repository, moduleRepo, frontEndAppRepo)
        {
            _shaPermissionManager = shaPermissionManager;
        }

        public override Task<List<DistributedConfigurableItemBase>> SortItemsAsync(List<DistributedConfigurableItemBase> items)
        {
            var localItems = items.Select(x =>
            {
                if (!(x is DistributedPermissionDefinition itemConfig))
                    throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(PermissionDefinition)}. Actual type is {x.GetType().FullName}");
                return itemConfig;
            }).ToList();

            var result = new List<DistributedConfigurableItemBase>();

            var addItems = (string? parent) => { };
            addItems = (string? parent) =>
            {
                var list = localItems.Where(x => x.Parent == parent);
                result.AddRange(list);
                foreach (var item in list)
                {
                    addItems(item.Name);
                }
            };

            addItems(null);

            return Task.FromResult(result);
        }

        protected override Task AfterImportAsync(PermissionDefinition item, DistributedPermissionDefinition distributedItem, IConfigurationItemsImportContext context)
        {
            /* TODO_V1: review usage of _shaPermissionManager and restore if required
            await _shaPermissionManager.EditPermissionAsync(dbItem.Name, dbItem);
            await _shaPermissionManager.CreatePermissionAsync(newItem);         
            */
            return Task.CompletedTask;
        }


        protected override Task<bool> CustomPropsAreEqualAsync(PermissionDefinition item, DistributedPermissionDefinition distributedItem)
        {
            var equals = item.Parent == distributedItem.Parent;
            return Task.FromResult(equals);
        }

        protected override Task MapCustomPropsToItemAsync(PermissionDefinition item, DistributedPermissionDefinition distributedItem)
        {
            item.Parent = distributedItem.Parent;

            return Task.CompletedTask;
        }
    }
}