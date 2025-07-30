using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Runtime.Session;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Validations;
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
    public class FormManager : ConfigurationItemManager<FormConfiguration>, IFormManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        public FormManager(
            IRepository<FormConfiguration, Guid> repository,
            IRepository<Module, Guid> moduleRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(repository, moduleRepository, unitOfWorkManager)
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public static string GetFormPermissionedObjectName(string? module, string name)
        {
            return $"{module}.{name}";
        }

        /// inheritedDoc
        public override async Task<FormConfiguration> CreateNewVersionAsync(FormConfiguration form)
        {
            // todo: check business rules

            var newVersion = new FormConfiguration();
            newVersion.Origin = form.Origin;
            newVersion.Name = form.Name;
            newVersion.Module = form.Module;
            newVersion.Description = form.Description;
            newVersion.Label = form.Label;
            newVersion.TenantId = form.TenantId;

            newVersion.ParentVersion = form; // set parent version
            newVersion.VersionNo = form.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.Markup = form.Markup;
            newVersion.ModelType = form.ModelType;
            newVersion.IsTemplate = form.IsTemplate;
            newVersion.Template = form.Template;
            newVersion.GenerationLogicTypeName = form.GenerationLogicTypeName;
            newVersion.GenerationLogicExtensionJson = form.GenerationLogicExtensionJson;
            newVersion.ConfigurationForm = form.ConfigurationForm;
            newVersion.PlaceholderIcon = form.PlaceholderIcon;
            newVersion.Normalize();

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
        public override async Task UpdateStatusAsync(FormConfiguration form, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Module == form.Module &&
                    v.Name == form.Name &&
                    v != form && 
                    v.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await Repository.UpdateAsync(version);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            form.VersionStatus = status;
            await Repository.UpdateAsync(form);
        }

        public async Task<List<FormConfiguration>> GetAllAsync()
        {
            return await Repository.GetAllListAsync();
        }

        /// inheritedDoc
        public async Task DeleteAllVersionsAsync(Guid id)
        {
            var config = await Repository.GetAsync(id);

            await Repository.DeleteAsync(f => f.Origin == config.Origin && !f.IsDeleted);
        }

        /// inheritedDoc
        public async Task MoveToModuleAsync(MoveToModuleInput input)
        {
            var form = await Repository.GetAsync(input.ItemId);
            var module = await ModuleRepository.GetAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (module == null)
                validationResults.Add(new ValidationResult("Module is mandatory", new List<string> { nameof(input.ModuleId) }));
            if (module != null && form != null)
            {
                var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == form.Name && f != form).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult($"Form with name `{form.Name}` already exists in module `{module.Name}`")
                    );
            }

            validationResults.ThrowValidationExceptionIfAny(L);

            form.NotNull();

            var allVersionsQuery = Repository.GetAll().Where(v => v.Origin == form.Origin);
            var allVersions = await allVersionsQuery.ToListAsync();

            foreach (var version in allVersions)
            {
                version.Module = module;
                await Repository.UpdateAsync(version);
            }            
        }

        /// inheritedDoc
        public async Task<FormConfiguration> CreateAsync(CreateFormConfigurationDto input)
        {
            var module = input.ModuleId.HasValue
                ? await ModuleRepository.GetAsync(input.ModuleId.Value)
                : null;

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add(new ValidationResult(
                    module != null
                        ? $"Form with name `{input.Name}` already exists in module `{module.Name}`"
                        : $"Form with name `{input.Name}` already exists"
                    )
                );
            validationResults.ThrowValidationExceptionIfAny(L);

            var template = input.TemplateId.HasValue
                ? await Repository.GetAsync(input.TemplateId.Value)
                : null;

            var form = new FormConfiguration();
            form.Name = input.Name;
            form.Module = module;
            form.Description = input.Description;
            form.Label = input.Label;

            form.VersionNo = 1;
            form.VersionStatus = ConfigurationItemVersionStatus.Draft;
            form.Origin = form;

            form.Markup = input.Markup ?? "";
            form.ModelType = input.ModelType;
            form.IsTemplate = input.IsTemplate;
            form.Template = template;
            form.GenerationLogicTypeName = input.GenerationLogicTypeName;
            form.GenerationLogicExtensionJson = input.GenerationLogicExtensionJson;
            form.ConfigurationForm = !input.ConfigurationFormName.IsNullOrWhiteSpace() ? new FormIdentifier(input.ConfigurationFormModule, input.ConfigurationFormName!) : null;
            form.PlaceholderIcon = input.PlaceholderIcon;
            form.Normalize();

            await Repository.InsertAsync(form);

            return form;
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(FormConfiguration item)
        {
            return Task.FromResult<IConfigurationItemDto>(ObjectMapper.Map<FormConfigurationDto>(item));
        }

        public override async Task<FormConfiguration> CopyAsync(FormConfiguration item, CopyItemInput input)
        {
            var srcForm = item;

            // todo: validate input
            var module = await ModuleRepository.FirstOrDefaultAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
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
                            ? $"Form with name `{input.Name}` already exists in module `{module.Name}`"
                            : $"Form with name `{input.Name}` already exists"
                        )
                    );
            }

            validationResults.ThrowValidationExceptionIfAny(L);

            var form = new FormConfiguration();
            form.Name = input.Name;
            form.Module = module;
            form.Description = input.Description;
            form.Label = input.Label;

            form.VersionNo = 1;
            form.VersionStatus = ConfigurationItemVersionStatus.Draft;
            form.Origin = form;

            form.Markup = srcForm.Markup;
            form.ModelType = srcForm.ModelType;
            form.IsTemplate = srcForm.IsTemplate;
            form.Template = srcForm.Template;
            form.GenerationLogicTypeName = srcForm.GenerationLogicTypeName;
            form.GenerationLogicExtensionJson = srcForm.GenerationLogicExtensionJson;
            form.ConfigurationForm = srcForm.ConfigurationForm;
            form.PlaceholderIcon = srcForm.PlaceholderIcon;
            form.Normalize();

            await Repository.InsertAsync(form);

            await _permissionedObjectManager.CopyAsync(
                GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                ShaPermissionedObjectsTypes.Form
            );

            return form;
        }

        public async Task<FormConfiguration> CopyAsync(CopyItemInput input)
        {
            var srcForm = await Repository.GetAsync(input.ItemId);
            return await CopyAsync(srcForm, input) as FormConfiguration;
        }
    }
}