using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
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
    public class ReferenceListManager : ConfigurationItemManager<ReferenceList, ReferenceListRevision>, IReferenceListManager, ITransientDependency
    {
        private readonly IRepository<ReferenceListItem, Guid> _listItemsRepository;

        public ReferenceListManager(IRepository<ReferenceListItem, Guid> listItemsRepository) : base()
        {
            _listItemsRepository = listItemsRepository;
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
            var revision = refList.EnsureLatestRevision();

            refList.Name = input.Name;
            refList.Module = module;
            revision.Description = input.Description;
            revision.Label = input.Label;

            refList.Origin = refList;

            refList.Normalize();

            await Repository.InsertAsync(refList);

            return refList;
        }

        private async Task CopyItemsAsync(ReferenceListRevision source, ReferenceListRevision destination)
        {
            var srcItems = await _listItemsRepository.GetAll().Where(i => i.ReferenceListRevision == source).ToListAsync();

            await CopyItemsAsync(srcItems, destination, null, null);
        }

        private async Task CopyItemsAsync(List<ReferenceListItem> sourceItems, ReferenceListRevision dstRevision, ReferenceListItem? sourceParent, ReferenceListItem? destinationParent)
        {
            var levelItems = sourceItems.Where(i => i.Parent == sourceParent).ToList();
            foreach (var srcItem in levelItems) 
            {
                var dstItem = CloneListItem(srcItem);
                dstItem.ReferenceListRevision = dstRevision;
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
                ReferenceListRevision = source.ReferenceListRevision,
                Parent = source.Parent,
                Color = source.Color,
                Icon = source.Icon,
                ShortAlias = source.ShortAlias,
            };
        }

        protected override async Task CopyRevisionPropertiesAsync(ReferenceListRevision source, ReferenceListRevision destination)
        {
            destination.NoSelectionValue = source.NoSelectionValue;

            await CopyItemsAsync(source, destination);
        }
    }
}