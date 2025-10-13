using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
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

        public ReferenceListImport(IRepository<ReferenceList, Guid> repository,
            IRepository<ReferenceListItem, Guid> refListItemRepo, 
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo): base (repository, moduleRepo, frontEndAppRepo)
        {
            _refListItemRepo = refListItemRepo;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        protected override async Task AfterImportAsync(ReferenceList item, DistributedReferenceList distributedItem, IConfigurationItemsImportContext context)
        {
            await ImportListItemLevelAsync(item, distributedItem.Items, null);
        }

        private async Task ImportListItemLevelAsync(ReferenceList referenceList, List<DistributedReferenceListItem> items, ReferenceListItem? parent)
        {
            foreach (var distributedItem in items)
            {
                var item = new ReferenceListItem() { ReferenceList = referenceList };

                MapListItem(distributedItem, item);
                item.Parent = parent;

                await _refListItemRepo.InsertAsync(item);

                if (distributedItem.ChildItems != null && distributedItem.ChildItems.Any())
                    await ImportListItemLevelAsync(referenceList, distributedItem.ChildItems, item);
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

        protected override Task<bool> CustomPropsAreEqualAsync(ReferenceList item, DistributedReferenceList distributedItem)
        {
            //var items = 
            // TODO_V1: use common code in export and import
            throw new NotImplementedException();
        }

        protected override Task MapCustomPropsToItemAsync(ReferenceList item, DistributedReferenceList distributedItem)
        {
            return Task.CompletedTask;
        }
    }
}