using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Reference list export
    /// </summary>
    public class ReferenceListExport : ConfigurableItemExportBase<ReferenceList, DistributedReferenceList>, IReferenceListExport, ITransientDependency
    {
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepo;

        public ReferenceListExport(IRepository<ReferenceListItem, Guid> refListItemRepo)
        {
            _refListItemRepo = refListItemRepo;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        protected override async Task MapCustomPropsAsync(ReferenceList item, DistributedReferenceList result)
        {
            result.Items = await ExportRefListItemsAsync(item);
        }

        private async Task<List<DistributedReferenceListItem>> ExportRefListItemsAsync(ReferenceList refList)
        {
            var items = await _refListItemRepo.GetAll().Where(item => item.ReferenceList == refList).ToListAsync();

            async Task ProcessRecursiveAsync(ReferenceListItem? parent, List<DistributedReferenceListItem> container) 
            {
                var levelItems = items.Where(item => item.Parent == parent).OrderBy(item => item.OrderIndex).ToList();
                foreach (var item in levelItems) 
                {
                    var distributedItem = new DistributedReferenceListItem();
                    MapListItem(item, distributedItem);

                    container.Add(distributedItem);

                    // process children
                    await ProcessRecursiveAsync(item, distributedItem.ChildItems);
                }
            }

            var result = new List<DistributedReferenceListItem>();
            await ProcessRecursiveAsync(null, result);
            return result;
        }

        private void MapListItem(ReferenceListItem src, DistributedReferenceListItem dst) 
        {
            dst.Item = src.Item;
            dst.ItemValue = src.ItemValue;
            dst.Description = src.Description;
            dst.OrderIndex = src.OrderIndex;
            dst.HardLinkToApplication = src.HardLinkToApplication;
            dst.Color = src.Color;
            dst.Icon = src.Icon;
            dst.ShortAlias = src.ShortAlias;
        }
    }
}