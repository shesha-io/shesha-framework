using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists.Dto;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        public async Task <ReferenceList> CreateAsync(CreateReferenceListDto input)
        {
            var module = input.ModuleId.HasValue
                ? await ModuleRepository.GetAsync(input.ModuleId.Value)
                : null;

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add(new ValidationResult(
                    module != null
                        ? $"Reference List with name `{input.Name}` already exists in module `{module.Name}`"
                        : $"Reference List with name `{input.Name}` already exists"
                    )
                );
            validationResults.ThrowValidationExceptionIfAny(L);

            var refList = new ReferenceList();

            refList.Name = input.Name;
            refList.Module = module;
            refList.Description = input.Description;
            refList.Label = input.Label;

            refList.Origin = refList;

            refList.Normalize();

            await Repository.InsertAsync(refList);

            return refList;
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
            };

            dto.Items = await _refListHelper.GetItemsAsync(refList.Id);

            return dto;
        }
    }
}