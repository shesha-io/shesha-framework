using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists
{
    /// inheritedDoc
    public class ReferenceListManager : ConfigurationItemManager<ReferenceList>, IReferenceListManager, ITransientDependency
    {
        private readonly IRepository<ReferenceListItem, Guid> _listItemsRepository;
        private readonly IReferenceListHelper _refListHelper;

        public ReferenceListManager(IRepository<ReferenceListItem, Guid> listItemsRepository, IReferenceListHelper refListHelper) : base()
        {
            _listItemsRepository = listItemsRepository;
            _refListHelper = refListHelper;
        }

        private async Task CopyItemsAsync(ReferenceList source, ReferenceList destination)
        {
            var srcItems = await _listItemsRepository.GetAll().Where(i => i.ReferenceList == source).ToListAsync();

            await CopyItemsAsync(srcItems, destination, null, null);
        }

        private async Task CopyItemsAsync(List<ReferenceListItem> sourceItems, ReferenceList dstRevision, ReferenceListItem? sourceParent, ReferenceListItem? destinationParent)
        {
            var levelItems = sourceItems.Where(i => i.Parent == sourceParent).ToList();
            foreach (var srcItem in levelItems) 
            {
                var dstItem = CloneListItem(srcItem);
                dstItem.ReferenceList = dstRevision;
                dstItem.Parent = destinationParent;

                await _listItemsRepository.InsertAsync(dstItem);

                await CopyItemsAsync(sourceItems, dstRevision, srcItem, dstItem);
            }
        }

        private ReferenceListItem CloneListItem(ReferenceListItem source) 
        {
            return new ReferenceListItem {
                Item = source.Item,
                ItemValue = source.ItemValue,
                Description = source.Description,
                OrderIndex = source.OrderIndex,
                //HardLinkToApplication = source.HardLinkToApplication,
                ReferenceList = source.ReferenceList,
                Parent = source.Parent,
                Color = source.Color,
                Icon = source.Icon,
                ShortAlias = source.ShortAlias,
            };
        }

        protected override async Task CopyItemPropertiesAsync(ReferenceList source, ReferenceList destination)
        {
            destination.NoSelectionValue = source.NoSelectionValue;

            await CopyItemsAsync(source, destination);
        }

        public override async Task<IConfigurationItemDto> MapToDtoAsync(ReferenceList refList)
        {
            var dto = new ReferenceListWithItemsDto
            {
                Id = refList.Id,
                ModuleId = refList.Module?.Id,
                Module = refList.Module?.Name,
                Name = refList.Name,
                Label = refList.Label,
                Description = refList.Description,
                Suppress = refList.Suppress,
            };

            dto.Items = await _refListHelper.GetItemsAsync(refList.Id);

            return dto;
        }

        public override async Task<string> GetBackwardCompatibleModuleNameAsync(string name)
        {
            var list = await _refListHelper.GetReferenceListAsync(new ReferenceListIdentifier(null, name));
            return list?.Module?.Name ?? string.Empty;
        }
    }
}