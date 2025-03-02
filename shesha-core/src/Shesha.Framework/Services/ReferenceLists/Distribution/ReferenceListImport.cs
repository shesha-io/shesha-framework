using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
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
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IReferenceListManager _refListManger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ReferenceListImport(IReferenceListManager formManger, 
            IRepository<ReferenceList, Guid> refListRepo, 
            IRepository<ReferenceListItem, Guid> refListItemRepo, 
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IUnitOfWorkManager unitOfWorkManager): base (moduleRepo, frontEndAppRepo)
        {
            _refListManger = formManger;
            _refListRepo = refListRepo;
            _refListItemRepo = refListItemRepo;
            _moduleRepo = moduleRepo;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedReferenceList refListItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedReferenceList)}. Actual type is {item.GetType().FullName}");

            return await ImportRefListAsync(refListItem, context);
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportRefListAsync(DistributedReferenceList item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingList = await _refListRepo.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync(e => e.IsLast);

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingList != null) 
            {
                switch (existingList.VersionStatus) 
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready: 
                    {
                        // cancel existing version
                        await _refListManger.CancelVersionAsync(existingList);
                        break;
                    }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live) 
                {
                    var liveVersion = existingList.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingList
                        : await _refListRepo.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync(f => f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveVersion != null)
                    {
                        await _refListManger.UpdateStatusAsync(liveVersion, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }

                // Create new version. Note: it copies all items
                var newListVersion = await _refListManger.CreateNewVersionWithoutItemsAsync(existingList);

                // important: set status according to the context
                newListVersion.VersionStatus = statusToImport;
                newListVersion.CreatedByImport = context.ImportResult;
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

                // fill audit?
                newList.VersionNo = 1;
                newList.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newList.VersionStatus = statusToImport;
                newList.CreatedByImport = context.ImportResult;

                newList.Normalize();

                await _refListRepo.InsertAsync(newList);

                await ImportListItemsAsync(newList, item.Items);

                return newList;
            }
        }

        private async Task ImportListItemsAsync(ReferenceList refList, List<DistributedReferenceListItem> distributedItems)
        {
            await ImportListItemLevelAsync(refList, distributedItems, null);
        }

        private async Task ImportListItemLevelAsync(ReferenceList refList, List<DistributedReferenceListItem> items, ReferenceListItem? parent)
        {
            foreach (var distributedItem in items)
            {
                var item = new ReferenceListItem();

                MapListItem(distributedItem, item);
                item.ReferenceList = refList;
                item.Parent = parent;

                await _refListItemRepo.InsertAsync(item);

                if (distributedItem.ChildItems != null && distributedItem.ChildItems.Any())
                    await ImportListItemLevelAsync(refList, distributedItem.ChildItems, item);
            }
        }


        private void MapListItem(DistributedReferenceListItem src, ReferenceListItem dst)
        {
            dst.Item = src.Item;
            dst.ItemValue = src.ItemValue;
            dst.Description = src.Description;
            dst.OrderIndex = src.OrderIndex;
            dst.Color = src.Color;
            dst.Icon = src.Icon;
            dst.ShortAlias = src.ShortAlias;
        }

        private void MapToRefList(DistributedReferenceList item, ReferenceList refList) 
        {
            refList.Name = item.Name;
            refList.Label = item.Label;
            refList.Description = item.Description;
            refList.VersionStatus = item.VersionStatus;
            refList.Suppress = item.Suppress;
        }
    }
}
