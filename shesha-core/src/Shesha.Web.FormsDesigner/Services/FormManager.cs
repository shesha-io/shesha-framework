using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Session;
using Abp.Runtime.Validation;
using Abp.Timing;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Web.FormsDesigner.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Form manager
    /// </summary>
    public class FormManager : ConfigurationItemManager<FormConfiguration>, IEventHandler<EntityUpdatingEventData<FormConfiguration>>, IFormManager, ITransientDependency
    {
        public FormManager(IRepository<FormConfiguration, Guid> repository, IRepository<ConfigurationItem, Guid> configurationItemRepository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager) : base(repository, configurationItemRepository, moduleRepository, unitOfWorkManager)
        {
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public override string ItemType => FormConfiguration.ItemTypeName;


        /// inheritedDoc
        public async Task<FormConfiguration> CreateNewVersionAsync(FormConfiguration form)
        {
            // todo: check business rules

            var newVersion = new FormConfiguration();
            newVersion.Configuration.Origin = form.Configuration.Origin;
            newVersion.Configuration.ItemType = form.Configuration.ItemType;
            newVersion.Configuration.Name = form.Configuration.Name;
            newVersion.Configuration.Module = form.Configuration.Module;
            newVersion.Configuration.Description = form.Configuration.Description;
            newVersion.Configuration.Label = form.Configuration.Label;
            newVersion.Configuration.TenantId = form.Configuration.TenantId;

            newVersion.Configuration.ParentVersion = form.Configuration; // set parent version
            newVersion.Configuration.VersionNo = form.Configuration.VersionNo + 1; // version + 1
            newVersion.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.Markup = form.Markup;
            newVersion.ModelType = form.ModelType;
            newVersion.Type = form.Type;
            newVersion.IsTemplate = form.IsTemplate;
            newVersion.Template = form.Template;
            newVersion.Normalize();

            await ConfigurationItemRepository.InsertAsync(newVersion.Configuration);
            await Repository.InsertAsync(newVersion);

            /* note: we must mark previous version as retired only during publication of the new version
            if (form.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live) 
            {
                form.Configuration.VersionStatus = ConfigurationItemVersionStatus.Retired;
                await ConfigurationItemRepository.UpdateAsync(form.Configuration);
            }
            */
            return newVersion;
        }

        /// inheritedDoc
        public async Task UpdateStatusAsync(FormConfiguration form, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Configuration.Module == form.Configuration.Module &&
                    v.Configuration.Name == form.Configuration.Name &&
                    v != form && 
                    v.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.Configuration.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await ConfigurationItemRepository.UpdateAsync(version.Configuration);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            form.Configuration.VersionStatus = status;
            await ConfigurationItemRepository.UpdateAsync(form.Configuration);
        }

        public void HandleEvent(EntityUpdatingEventData<FormConfiguration> eventData)
        {
            if (eventData.Entity.Configuration != null)
            {
                eventData.Entity.Configuration.LastModificationTime = Clock.Now;
                eventData.Entity.Configuration.LastModifierUserId = AbpSession?.UserId;
                ConfigurationItemRepository.InsertOrUpdate(eventData.Entity.Configuration);
            }
        }

        /// inheritedDoc
        public async Task DeleteAllVersionsAsync(Guid id)
        {
            var config = await ConfigurationItemRepository.GetAsync(id);

            await ConfigurationItemRepository.DeleteAsync(f => f.Origin == config.Origin && !f.IsDeleted);
        }

        /// inheritedDoc
        public async Task MoveToModuleAsync(MoveToModuleInput input)
        {
            var form = await Repository.GetAsync(input.ItemId);
            var module = await ModuleRepository.GetAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (form == null)
                validationResults.Add(new ValidationResult("Please select a form to move", new List<string> { nameof(input.ItemId) }));
            if (module == null)
                validationResults.Add(new ValidationResult("Module is mandatory", new List<string> { nameof(input.ModuleId) }));
            if (module != null && form != null)
            {
                var alreadyExist = await Repository.GetAll().Where(f => f.Configuration.Module == module && f.Configuration.Name == form.Configuration.Name && f != form).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult($"Form with name `{form.Configuration.Name}` already exists in module `{module.Name}`")
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var allVersionsQuery = Repository.GetAll().Where(v => v.Configuration.Origin == form.Configuration.Origin);
            var allVersions = await allVersionsQuery.ToListAsync();

            foreach (var version in allVersions)
            {
                version.Configuration.Module = module;
                await ConfigurationItemRepository.UpdateAsync(version.Configuration);
            }            
        }

        /// inheritedDoc
        public async Task<FormConfiguration> CreateAsync(CreateFormConfigurationDto input)
        {
            var module = input.ModuleId.HasValue
                ? await ModuleRepository.GetAsync(input.ModuleId.Value)
                : null;

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Configuration.Module == module && f.Configuration.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add(new ValidationResult(
                    module != null
                        ? $"Form with name `{input.Name}` already exists in module `{module.Name}`"
                        : $"Form with name `{input.Name}` already exists"
                    )
                );
            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var template = input.TemplateId.HasValue
                ? await Repository.GetAsync(input.TemplateId.Value)
                : null;

            var form = new FormConfiguration();
            form.Configuration.Name = input.Name;
            form.Configuration.Module = module;
            form.Configuration.Description = input.Description;
            form.Configuration.Label = input.Label;

            form.Configuration.VersionNo = 1;
            form.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft;
            form.Configuration.Origin = form.Configuration;

            form.Markup = input.Markup;
            form.ModelType = input.ModelType;
            form.Type = input.Type;
            form.IsTemplate = input.IsTemplate;
            form.Template = template;
            form.Normalize();

            await ConfigurationItemRepository.InsertAsync(form.Configuration);
            await Repository.InsertAsync(form);

            return form;
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item)
        {
            return Task.FromResult<IConfigurationItemDto>(ObjectMapper.Map<FormConfigurationDto>(item));
        }

        public override async Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input)
        {
            var srcForm = item as FormConfiguration;

            // todo: validate input
            var module = await ModuleRepository.FirstOrDefaultAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (srcForm == null)
                validationResults.Add(new ValidationResult("Please select a form to copy", new List<string> { nameof(input.ItemId) }));
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
                            ? $"Form with name `{input.Name}` already exists in module `{module.Name}`"
                            : $"Form with name `{input.Name}` already exists"
                        )
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var form = new FormConfiguration();
            form.Configuration.Name = input.Name;
            form.Configuration.Module = module;
            form.Configuration.Description = input.Description;
            form.Configuration.Label = input.Label;

            form.Configuration.VersionNo = 1;
            form.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft;
            form.Configuration.Origin = form.Configuration;

            form.Markup = srcForm.Markup;
            form.ModelType = srcForm.ModelType;
            form.Type = srcForm.Type;
            form.IsTemplate = srcForm.IsTemplate;
            form.Template = srcForm.Template;
            form.Normalize();

            await ConfigurationItemRepository.InsertAsync(form.Configuration);
            await Repository.InsertAsync(form);

            return form;
        }

        public async Task<FormConfiguration> CopyAsync(CopyItemInput input)
        {
            var srcForm = await Repository.GetAsync(input.ItemId);
            return await CopyAsync(srcForm, input) as FormConfiguration;
        }

        public override async Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item)
        {
            var form = item as FormConfiguration;
            if (form == null)
                throw new ArgumentException($"{nameof(item)} must be of type {nameof(FormConfiguration)}", nameof(item));

            var result = await CreateNewVersionAsync(form);
            return result;
        }
    }
}