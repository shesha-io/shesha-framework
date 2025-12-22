using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Reference list import
    /// </summary>
    public class ReferenceListImport : ConfigurationItemImportBase<ReferenceList, DistributedReferenceList>, IReferenceListImport, ITransientDependency
    {
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepo;
        private readonly IReferenceListDistributionHelper _distributionHelper;

        public ReferenceListImport(IRepository<ReferenceList, Guid> repository,
            IRepository<ReferenceListItem, Guid> refListItemRepo,
            IReferenceListDistributionHelper distributionHelper,
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo): base (repository, moduleRepo, frontEndAppRepo)
        {
            _refListItemRepo = refListItemRepo;
            _distributionHelper = distributionHelper;
        }

        public override string ItemType => ReferenceList.ItemTypeName;

        protected override async Task AfterImportAsync(ReferenceList item, DistributedReferenceList distributedItem, IConfigurationItemsImportContext context)
        {
            // get all current items
            var currentItems = await _refListItemRepo.GetAll().Where(e => e.ReferenceList == item).ToListAsync();

            await ImportListItemLevelAsync(item, distributedItem.Items, null, currentItems);

            // delete unprocessed items
            foreach (var existingItem in currentItems)
            {
                await _refListItemRepo.DeleteAsync(existingItem.Id);
            }
        }

        private async Task ImportListItemLevelAsync(ReferenceList referenceList, 
            List<DistributedReferenceListItem> items, 
            ReferenceListItem? parent, 
            List<ReferenceListItem> existingItems)
        {
            foreach (var distributedItem in items)
            {
                var existingItem = existingItems.FirstOrDefault(e => e.ItemValue == distributedItem.ItemValue);
                // remove item from the list
                if (existingItem != null)
                    existingItems.Remove(existingItem);

                var item = existingItem ?? new ReferenceListItem() { ReferenceList = referenceList };

                MapListItem(distributedItem, item);
                item.Parent = parent;

                await _refListItemRepo.InsertAsync(item);

                if (distributedItem.ChildItems != null && distributedItem.ChildItems.Any())
                    await ImportListItemLevelAsync(referenceList, distributedItem.ChildItems, item, existingItems);
            }
        }


        private void MapListItem(DistributedReferenceListItem src, ReferenceListItem dst)
        {
            dst.Item = src.Item ?? string.Empty;
            dst.ItemValue = src.ItemValue;
            dst.Description = src.Description ?? string.Empty;
            dst.OrderIndex = src.OrderIndex;
            dst.Color = src.Color ?? string.Empty;
            dst.Icon = src.Icon ?? string.Empty;
            dst.ShortAlias = src.ShortAlias ?? string.Empty;
        }

        protected override async Task<bool> CustomPropsAreEqualAsync(ReferenceList item, DistributedReferenceList distributedItem)
        {
            var currentItems = await _distributionHelper.ExportRefListItemsAsync(item);
            return _distributionHelper.ItemsAreEqual(currentItems, distributedItem.Items);
        }

        protected override Task MapCustomPropsToItemAsync(ReferenceList item, DistributedReferenceList distributedItem)
        {
            return Task.CompletedTask;
        }
    }
}