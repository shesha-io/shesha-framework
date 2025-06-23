using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
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
    public class ReferenceListImport: ConfigurationItemImportBase<ReferenceList, DistributedReferenceList>, IReferenceListImport, ITransientDependency
    {
        private readonly IRepository<ReferenceList, Guid> _refListRepo;
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepo;
        private readonly IReferenceListManager _refListManger;

        public ReferenceListImport(IReferenceListManager formManger, 
            IRepository<ReferenceList, Guid> refListRepo, 
            IRepository<ReferenceListItem, Guid> refListItemRepo, 
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo): base (moduleRepo, frontEndAppRepo)
        {
            _refListManger = formManger;
            _refListRepo = refListRepo;
            _refListItemRepo = refListItemRepo;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        /// inheritedDoc
        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedReferenceList refListItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedReferenceList)}. Actual type is {item.GetType().FullName}");

            return ImportRefListAsync(refListItem, context);
        }

        /// inheritedDoc
        protected async Task<ConfigurationItem> ImportRefListAsync(DistributedReferenceList item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingList = await _refListRepo.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync();

            if (existingList != null) 
            {
                // Create new version. Note: it copies all items
                var newListVersion = await _refListManger.CreateNewVersionWithoutItemsAsync(existingList);

                newListVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _refListRepo.UpdateAsync(newListVersion);

                await ImportListItemsAsync(newListVersion, item.Items);

                return newListVersion;
            } else 
            {
                var newList = new ReferenceList();
                MapToRefList(item, newList);

                newList.Module = await GetModuleAsync(item.ModuleName, context);

                // TODO: V1 review
                //newList.CreatedByImport = context.ImportResult;

                newList.Normalize();

                await _refListRepo.InsertAsync(newList);

                await ImportListItemsAsync(newList, item.Items);

                return newList;
            }
        }

        private Task ImportListItemsAsync(ReferenceList refList, List<DistributedReferenceListItem> distributedItems)
        {
            return ImportListItemLevelAsync(refList, distributedItems, null);
        }

        private async Task ImportListItemLevelAsync(ReferenceList refList, List<DistributedReferenceListItem> items, ReferenceListItem? parent)
        {
            var revision = refList.EnsureLatestRevision();
            foreach (var distributedItem in items)
            {
                var item = new ReferenceListItem() { ReferenceListRevision = revision };

                MapListItem(distributedItem, item);
                item.Parent = parent;

                await _refListItemRepo.InsertAsync(item);

                if (distributedItem.ChildItems != null && distributedItem.ChildItems.Any())
                    await ImportListItemLevelAsync(refList, distributedItem.ChildItems, item);
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

        private void MapToRefList(DistributedReferenceList item, ReferenceList refList) 
        {
            var revision = refList.EnsureLatestRevision();
            refList.Name = item.Name;
            refList.Suppress = item.Suppress;

            revision.Label = item.Label;
            revision.Description = item.Description;            
        }
    }
}