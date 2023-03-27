using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Validation;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists.Dto;
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

        public ReferenceListManager(IRepository<ReferenceList, Guid> repository, 
            IRepository<ConfigurationItem, Guid> configurationItemRepository, 
            IRepository<Module, Guid> moduleRepository, 
            IUnitOfWorkManager unitOfWorkManager, 
            IRepository<ReferenceListItem, Guid> listItemsRepository) : base(repository, moduleRepository, unitOfWorkManager)
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
            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var refList = new ReferenceList();
            refList.Name = input.Name;
            refList.Module = module;
            refList.Description = input.Description;
            refList.Label = input.Label;

            refList.VersionNo = 1;
            refList.VersionStatus = ConfigurationItemVersionStatus.Draft;
            refList.Origin = refList;

            refList.Normalize();

            await Repository.InsertAsync(refList);

            return refList;
        }

        public async Task UpdateAsync(ReferenceList refList, UpdateReferenceListDto input)
        {
            await UpdateNameAndModuleAsync(refList, input.ModuleId, input.Name);

            refList.Label = input.Label;
            refList.Description = input.Description;

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
                if (refList.Name != name && refList.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Name can't be changed for the Reference List that is hard linked to the application code"));
                if (refList.Module?.Id != moduleId && refList.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Module can't be changed for the Reference List that is hard linked to the application code"));

                var alreadyExists = await Repository.GetAll().Where(v => v.Name == name && v.Module == newModule).AnyAsync();
                if (alreadyExists)
                    validationResults.Add(new ValidationResult(newModule != null
                        ? $"Reference List with name `{name}` already exists in module `{newModule.Name}`"
                        : $"Reference List with name `{name}` already exists")
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);


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

        public override async Task<ReferenceList> CopyAsync(ReferenceList item, CopyItemInput input)
        {
            var srcList = item as ReferenceList;

            // todo: validate input
            var module = await ModuleRepository.FirstOrDefaultAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (srcList == null)
                validationResults.Add(new ValidationResult("Please select a referencelist to copy", new List<string> { nameof(input.ItemId) }));
            if (module == null)
                validationResults.Add(new ValidationResult("Module is mandatory", new List<string> { nameof(input.ModuleId) }));
            if (string.IsNullOrWhiteSpace(input.Name))
                validationResults.Add(new ValidationResult("Name is mandatory", new List<string> { nameof(input.Name) }));

            if (module != null && !string.IsNullOrWhiteSpace(input.Name))
            {
                var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == input.Name).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult(
                        module != null
                            ? $"Reference List with name `{input.Name}` already exists in module `{module.Name}`"
                            : $"Reference List with name `{input.Name}` already exists"
                        )
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var listCopy = new ReferenceList();
            listCopy.Name = input.Name;
            listCopy.Module = module;
            listCopy.Description = input.Description;
            listCopy.Label = input.Label;

            listCopy.VersionNo = 1;
            listCopy.VersionStatus = ConfigurationItemVersionStatus.Draft;
            listCopy.Origin = listCopy;

            listCopy.NoSelectionValue = srcList.NoSelectionValue;
            listCopy.Normalize();

            await Repository.InsertAsync(listCopy);

            await CopyItemsAsync(srcList, listCopy);

            return listCopy;
        }

        private async Task CopyItemsAsync(ReferenceList source, ReferenceList destination) 
        {
            var srcItems = await _listItemsRepository.GetAll().Where(i => i.ReferenceList == source).ToListAsync();

            await CopyItemsAsync(srcItems, null, null, destination);
        }

        private async Task CopyItemsAsync(List<ReferenceListItem> sourceItems, ReferenceListItem sourceParent, ReferenceListItem destinationParent, ReferenceList destination)
        {
            var levelItems = sourceItems.Where(i => i.Parent == sourceParent).ToList();
            foreach (var srcItem in levelItems) 
            {
                var dstItem = CloneListItem(srcItem);
                dstItem.ReferenceList = destination;
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
                ReferenceList = source.ReferenceList,
                Parent = source.Parent,
                Color = source.Color,
                Icon = source.Icon,
                ShortAlias = source.ShortAlias,
            };
        }

        public async Task<ReferenceList> CreateNewVersionWithoutItemsAsync(ReferenceList srcList) 
        {
            var newVersion = new ReferenceList();
            newVersion.Origin = srcList.Origin;
            newVersion.Name = srcList.Name;
            newVersion.Module = srcList.Module;
            newVersion.Description = srcList.Description;
            newVersion.Label = srcList.Label;
            newVersion.TenantId = srcList.TenantId;

            newVersion.ParentVersion = srcList; // set parent version
            newVersion.VersionNo = srcList.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        public override async Task<ReferenceList> CreateNewVersionAsync(ReferenceList srcList)
        {
            var newVersion = await CreateNewVersionWithoutItemsAsync(srcList);
            
            await CopyItemsAsync(srcList, newVersion);

            return newVersion;
        }
    }
}
