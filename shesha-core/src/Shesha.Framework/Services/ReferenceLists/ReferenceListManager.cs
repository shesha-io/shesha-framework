using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
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

        public async Task UpdateAsync(ReferenceList refList, UpdateReferenceListDto input)
        {
            await UpdateNameAndModuleAsync(refList, input.ModuleId, input.Name);

            var revision = refList.EnsureLatestRevision();

            revision.Label = input.Label;
            revision.Description = input.Description;

            await Repository.UpdateAsync(refList);
        }

        private async Task UpdateNameAndModuleAsync(ReferenceList refList, Guid? moduleId, string name)
        {
            var validationResults = new List<ValidationResult>();

            var needUpdate = refList.Name != name || refList.Module?.Id != moduleId;
            if (!needUpdate)
                return;

            var newModule = moduleId.HasValue
                ? await ModuleRepository.GetAsync(moduleId.Value)
                : null;

            if (string.IsNullOrWhiteSpace(name))
                validationResults.Add(new ValidationResult("Name field is required"));
            else {
                if (refList.Name != name && refList.LatestRevision != null && refList.LatestRevision.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Name can't be changed for the Reference List that is hard linked to the application code"));
                if (refList.Module?.Id != moduleId && refList.LatestRevision != null && refList.LatestRevision.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Module can't be changed for the Reference List that is hard linked to the application code"));

                var alreadyExists = await Repository.GetAll().Where(v => v.Name == name && v.Module == newModule).AnyAsync();
                if (alreadyExists)
                    validationResults.Add(new ValidationResult(newModule != null
                        ? $"Reference List with name `{name}` already exists in module `{newModule.Name}`"
                        : $"Reference List with name `{name}` already exists")
                    );
            }

            validationResults.ThrowValidationExceptionIfAny(L);


            var allVersions = await Repository.GetAll().Where(v => v.Name == refList.Name && v.Module == refList.Module).ToListAsync();

            foreach (var version in allVersions) 
            {
                version.Module = newModule;
                version.Name = name;
                
                await Repository.UpdateAsync(version);
            }
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(ReferenceList item)
        {
            var dto = ObjectMapper.Map<ReferenceListDto>(item);
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        private async Task CopyItemsAsync(List<ReferenceListItem> sourceItems, ReferenceListItem? sourceParent, ReferenceListItem? destinationParent, ReferenceList destination)
        {
            var dstRevision = destination.EnsureLatestRevision();
            var levelItems = sourceItems.Where(i => i.Parent == sourceParent).ToList();
            foreach (var srcItem in levelItems) 
            {
                var dstItem = CloneListItem(srcItem);
                dstItem.ReferenceListRevision = dstRevision;
                dstItem.Parent = destinationParent;

                await _listItemsRepository.InsertAsync(dstItem);

                await CopyItemsAsync(sourceItems, srcItem, dstItem, destination);
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

        public async Task<ReferenceList> CreateNewVersionWithoutItemsAsync(ReferenceList srcList) 
        {
            var newVersion = new ReferenceList();
            var revision = newVersion.EnsureLatestRevision();

            newVersion.Origin = srcList.Origin;
            newVersion.Name = srcList.Name;
            newVersion.Module = srcList.Module;

            revision.Description = srcList.Revision.Description;
            revision.Label = srcList.Revision.Label;

            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        public override Task<ReferenceList> ExposeAsync(ReferenceList item, Module module)
        {
            throw new NotImplementedException();
        }

        public override async Task<ReferenceList> CreateItemAsync(CreateItemInput input)
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Reference List with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var refList = new ReferenceList
            {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            refList.Origin = refList;

            await Repository.InsertAsync(refList);

            var revision = refList.MakeNewRevision();

            revision.Description = input.Description;
            revision.Label = input.Label;
            refList.Normalize();

            await RevisionRepository.InsertAsync(revision);

            return refList;
        }

        protected override Task CopyRevisionPropertiesAsync(ReferenceListRevision source, ReferenceListRevision destination)
        {
            throw new NotImplementedException();
        }
    }
}