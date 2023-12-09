using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Reference list export
    /// </summary>
    public class ReferenceListExport: IReferenceListExport, ITransientDependency
    {
        private readonly IRepository<ReferenceList, Guid> _refListRepo;
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepo;

        public ReferenceListExport(IRepository<ReferenceList, Guid> refListRepo, IRepository<ReferenceListItem, Guid> refListItemRepo)
        {
            _refListRepo = refListRepo;
            _refListItemRepo = refListItemRepo;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id) 
        {
            var item = await _refListRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is ReferenceList refList))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ReferenceList)}, actual: {item.GetType().FullName}");

            var result = new DistributedReferenceList
            {
                Id = refList.Id,
                Name = refList.Name,
                ModuleName = refList.Module?.Name,
                FrontEndApplication = refList.Application?.AppKey,
                ItemType = refList.ItemType,

                Label = refList.Label,
                Description = refList.Description,
                OriginId = refList.Origin?.Id,
                BaseItem = refList.BaseItem?.Id,
                VersionNo = refList.VersionNo,
                VersionStatus = refList.VersionStatus,
                ParentVersionId = refList.ParentVersion?.Id,
                Suppress = refList.Suppress,

                // reflist specific properties
                Items = await ExportRefListItemsAsync(refList),
                /*
                Markup = refList.Markup,
                ModelType = refList.ModelType,
                TemplateId = refList.Template?.Id,
                */
            };

            return result;

        }

        private async Task<List<DistributedReferenceListItem>> ExportRefListItemsAsync(ReferenceList refList)
        {
            var items = await _refListItemRepo.GetAll().Where(item => item.ReferenceList == refList).ToListAsync();

            async Task ProcessRecursiveAsync(ReferenceListItem parent, List<DistributedReferenceListItem> container) 
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

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}
