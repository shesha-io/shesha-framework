using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    public class ReferenceListDistributionHelper : IReferenceListDistributionHelper, ITransientDependency
    {
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepo;

        public ReferenceListDistributionHelper(IRepository<ReferenceListItem, Guid> refListItemRepo)
        {
            _refListItemRepo = refListItemRepo;
        }

        public async Task<List<DistributedReferenceListItem>> ExportRefListItemsAsync(ReferenceList refList)
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

        public bool ItemsAreEqual(List<DistributedReferenceListItem> itemsA, List<DistributedReferenceListItem> itemsB)
        {
            if (itemsA.Count != itemsB.Count)
                return false;

            var itemsAOrdered = itemsA.OrderBy(item => item.OrderIndex).ToList();
            var itemsBOrdered = itemsB.OrderBy(item => item.OrderIndex).ToList();

            for (int i = 0; i < itemsAOrdered.Count; i++)
            {
                if (!itemsAOrdered[i].Equals(itemsBOrdered[i]))
                    return false;
            }

            return true;
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
