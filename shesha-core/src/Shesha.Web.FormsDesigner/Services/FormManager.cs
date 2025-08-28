using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Runtime.Session;
using DocumentFormat.OpenXml.Office2016.Excel;
using Microsoft.AspNetCore.Mvc.Rendering;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
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
    public class FormManager : ConfigurationItemManager<FormConfiguration, FormConfigurationRevision>, IFormManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IModuleManager _moduleManager;
        private readonly IRepository<FormConfigurationRevision, Guid> _revisionRepo;

        public FormManager(
            IPermissionedObjectManager permissionedObjectManager,
            IModuleManager moduleManager,
            IRepository<FormConfigurationRevision, Guid> revisionRepo
        ) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
            _moduleManager = moduleManager;
            _revisionRepo = revisionRepo;
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

            // TODO: V1 review
            //newVersion.Description = form.Description;
            //newVersion.Label = form.Label;
            //newVersion.Markup = form.Markup;
            //newVersion.ModelType = form.ModelType;
            //newVersion.IsTemplate = form.IsTemplate;
            //newVersion.Template = form.Template;
            //newVersion.GenerationLogicTypeName = form.GenerationLogicTypeName;
            //newVersion.GenerationLogicExtensionJson = form.GenerationLogicExtensionJson;
            //newVersion.ConfigurationForm = form.ConfigurationForm;
            //newVersion.PlaceholderIcon = form.PlaceholderIcon;
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

        public Task<List<FormConfiguration>> GetAllAsync()
        {
            return Repository.GetAllListAsync();
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
        [Obsolete]
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

            form.Origin = form;

            // TODO: V1 review
            var revision = form.EnsureLatestRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            revision.Markup = input.Markup ?? "";
            revision.ModelType = input.ModelType;
            revision.IsTemplate = input.IsTemplate;
            // revision.Template = template;
            revision.GenerationLogicTypeName = input.GenerationLogicTypeName;
            revision.GenerationLogicExtensionJson = input.GenerationLogicExtensionJson;
            revision.ConfigurationForm = !input.ConfigurationFormName.IsNullOrWhiteSpace() ? new FormIdentifier(input.ConfigurationFormModule, input.ConfigurationFormName!) : null;
            revision.PlaceholderIcon = input.PlaceholderIcon;
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

            form.Origin = form;

            // TODO: V1 review
            var revision = form.EnsureLatestRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            revision.Markup = srcForm.Revision.Markup;
            revision.ModelType = srcForm.Revision.ModelType;
            revision.IsTemplate = srcForm.Revision.IsTemplate;
            //revision.Template = srcForm.Template;
            revision.GenerationLogicTypeName = srcForm.Revision.GenerationLogicTypeName;
            revision.GenerationLogicExtensionJson = srcForm.Revision.GenerationLogicExtensionJson;
            revision.ConfigurationForm = srcForm.Revision.ConfigurationForm;
            revision.PlaceholderIcon = srcForm.Revision.PlaceholderIcon;
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

        public override async Task<FormConfiguration> ExposeAsync(FormConfiguration item, Module module)
        {
            var srcRevision = item.LatestRevision;

            var exposedConfig = new FormConfiguration { 
                Name = item.Name,
                Module = module,
                ExposedFrom = item,
                ExposedFromRevision = srcRevision,
                SurfaceStatus = Domain.Enums.RefListSurfaceStatus.Overridden,
            };
            var exposedRevision = exposedConfig.EnsureLatestRevision();

            await MapRevisionAsync(srcRevision, exposedRevision);
            exposedRevision.VersionNo = 1;
            exposedRevision.VersionName = null;            

            await Repository.InsertAsync(exposedConfig);
            await _revisionRepo.InsertOrUpdateAsync(exposedRevision);

            return exposedConfig;
        }

        
        private async Task MapRevisionAsync(FormConfigurationRevision srcRevision, FormConfigurationRevision dstRevision) 
        {
            await MapRevisionBaseAsync(srcRevision, dstRevision);

            dstRevision.Markup = srcRevision.Markup;
            dstRevision.ModelType = srcRevision.ModelType;
            dstRevision.IsTemplate = srcRevision.IsTemplate;
        }

        private Task MapRevisionBaseAsync(ConfigurationItemRevision srcRevision, ConfigurationItemRevision dstRevision) 
        {
            dstRevision.Label = srcRevision.Label;
            dstRevision.Description = srcRevision.Description;
            dstRevision.Comments = srcRevision.Comments;
            dstRevision.ConfigHash = srcRevision.ConfigHash;

            return Task.CompletedTask;
        }

        public override async Task<FormConfiguration> CreateItemAsync(CreateItemInput input)
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Form with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var template = input.TemplateId.HasValue
                ? await RevisionRepository.GetAsync(input.TemplateId.Value)
                : null;
            
            var form = new FormConfiguration {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
                OrderIndex = input.OrderIndex,
            };
            form.Origin = form;

            await Repository.InsertAsync(form);

            var revision = form.MakeNewRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            revision.Markup = input.Markup ?? string.Empty;
            revision.IsTemplate = false;
            revision.ModelType = input.ModelType;
            revision.GenerationLogicExtensionJson = input.GenerationLogicExtensionJson;
            revision.Template = template;
            form.Normalize();

            await RevisionRepository.InsertAsync(revision);

            return form;
        }

        public override Task<FormConfiguration> DuplicateAsync(FormConfiguration item)
        {
            throw new NotImplementedException();
        }
    }
}