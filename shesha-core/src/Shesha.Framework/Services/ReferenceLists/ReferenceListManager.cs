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
        public override string ItemType => ReferenceList.ItemTypeName;

        private readonly IRepository<ReferenceListItem, Guid> _listItemsRepository;

        public ReferenceListManager(IRepository<ReferenceList, Guid> repository, 
            IRepository<ConfigurationItem, Guid> configurationItemRepository, 
            IRepository<Module, Guid> moduleRepository, 
            IUnitOfWorkManager unitOfWorkManager, 
            IRepository<ReferenceListItem, Guid> listItemsRepository) : base(repository, configurationItemRepository, moduleRepository, unitOfWorkManager)
        {
            _listItemsRepository = listItemsRepository;
        }

        public async Task <ReferenceList> CreateAsync(CreateReferenceListDto input)
        {
            var module = input.ModuleId.HasValue
                ? await ModuleRepository.GetAsync(input.ModuleId.Value)
                : null;

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Configuration.Module == module && f.Configuration.Name == input.Name).AnyAsync();
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
            refList.Configuration.Name = input.Name;
            refList.Configuration.Module = module;
            refList.Configuration.Description = input.Description;
            refList.Configuration.Label = input.Label;

            refList.Configuration.VersionNo = 1;
            refList.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft;
            refList.Configuration.Origin = refList.Configuration;

            refList.Normalize();

            await ConfigurationItemRepository.InsertAsync(refList.Configuration);
            await Repository.InsertAsync(refList);

            return refList;
        }

        public async Task UpdateAsync(ReferenceList refList, UpdateReferenceListDto input)
        {
            await UpdateNameAndModuleAsync(refList, input.ModuleId, input.Name);

            refList.Configuration.Label = input.Label;
            refList.Configuration.Description = input.Description;

            await Repository.UpdateAsync(refList);
            await ConfigurationItemRepository.UpdateAsync(refList.Configuration);
        }

        private async Task UpdateNameAndModuleAsync(ReferenceList refList, Guid? moduleId, string name)
        {
            var validationResults = new List<ValidationResult>();

            var needUpdate = refList.Configuration.Name != name || refList.Configuration.Module?.Id != moduleId;
            if (!needUpdate)
                return;

            var newModule = moduleId.HasValue
                ? await ModuleRepository.GetAsync(moduleId.Value)
                : null;

            if (string.IsNullOrWhiteSpace(name))
                validationResults.Add(new ValidationResult("Name field is required"));
            else {
                if (refList.Configuration.Name != name && refList.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Name can't be changed for the Reference List that is hard linked to the application code"));
                if (refList.Configuration.Module?.Id != moduleId && refList.HardLinkToApplication)
                    validationResults.Add(new ValidationResult("Module can't be changed for the Reference List that is hard linked to the application code"));

                var alreadyExists = await Repository.GetAll().Where(v => v.Configuration.Name == name && v.Configuration.Module == newModule).AnyAsync();
                if (alreadyExists)
                    validationResults.Add(new ValidationResult(newModule != null
                        ? $"Reference List with name `{name}` already exists in module `{newModule.Name}`"
                        : $"Reference List with name `{name}` already exists")
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);


            var allVersions = await Repository.GetAll().Where(v => v.Configuration.Name == refList.Configuration.Name && v.Configuration.Module == refList.Configuration.Module).ToListAsync();

            foreach (var version in allVersions) 
            {
                version.Configuration.Module = newModule;
                version.Configuration.Name = name;
                
                await ConfigurationItemRepository.UpdateAsync(version.Configuration);
                await Repository.UpdateAsync(version);
            }
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item)
        {
            var dto = ObjectMapper.Map<ReferenceListDto>(item);
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        public override async Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input)
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
                var alreadyExist = await Repository.GetAll().Where(f => f.Configuration.Module == module && f.Configuration.Name == input.Name).AnyAsync();
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
            listCopy.Configuration.Name = input.Name;
            listCopy.Configuration.Module = module;
            listCopy.Configuration.Description = input.Description;
            listCopy.Configuration.Label = input.Label;

            listCopy.Configuration.VersionNo = 1;
            listCopy.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft;
            listCopy.Configuration.Origin = listCopy.Configuration;

            listCopy.NoSelectionValue = srcList.NoSelectionValue;
            listCopy.Normalize();

            await ConfigurationItemRepository.InsertAsync(listCopy.Configuration);
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
                //dstItem.Id = Guid.NewGuid(); // todo: use generator to generate sequential ids

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

        public override async Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item)
        {
            var refList = item as ReferenceList;
            if (refList == null)
                throw new ArgumentException($"{nameof(item)} must be of type {nameof(ReferenceList)}", nameof(item));

            var result = await CreateNewVersionAsync(refList);
            return result;
        }

        public async Task<ReferenceList> CreateNewVersionAsync(ReferenceList srcList)
        {
            // todo: check business rules

            var newVersion = new ReferenceList();
            newVersion.Configuration.Origin = srcList.Configuration.Origin;
            newVersion.Configuration.ItemType = srcList.Configuration.ItemType;
            newVersion.Configuration.Name = srcList.Configuration.Name;
            newVersion.Configuration.Module = srcList.Configuration.Module;
            newVersion.Configuration.Description = srcList.Configuration.Description;
            newVersion.Configuration.Label = srcList.Configuration.Label;
            newVersion.Configuration.TenantId = srcList.Configuration.TenantId;

            newVersion.Configuration.ParentVersion = srcList.Configuration; // set parent version
            newVersion.Configuration.VersionNo = srcList.Configuration.VersionNo + 1; // version + 1
            newVersion.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            /*
            newVersion.Markup = form.Markup;
            newVersion.ModelType = form.ModelType;
            newVersion.Type = form.Type;
            newVersion.IsTemplate = form.IsTemplate;
            newVersion.Template = form.Template;
            */
            newVersion.Normalize();

            await ConfigurationItemRepository.InsertAsync(newVersion.Configuration);
            await Repository.InsertAsync(newVersion);

            await CopyItemsAsync(srcList, newVersion);

            /* note: we must mark previous version as retired only during publication of the new version
            if (form.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live) 
            {
                form.Configuration.VersionStatus = ConfigurationItemVersionStatus.Retired;
                await ConfigurationItemRepository.UpdateAsync(form.Configuration);
            }
            */
            return newVersion;
        }
    }
}
