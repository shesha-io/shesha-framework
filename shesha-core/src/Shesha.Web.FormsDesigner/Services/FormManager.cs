using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Validations;
using Shesha.Web.FormsDesigner.Dtos;
using System;
using System.Collections.Generic;
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
        
        public FormManager(
            IPermissionedObjectManager permissionedObjectManager,
            IModuleManager moduleManager,
            IRepository<FormConfigurationRevision, Guid> revisionRepo
        ) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public static string GetFormPermissionedObjectName(string? module, string name)
        {
            return $"{module}.{name}";
        }

        public Task<List<FormConfiguration>> GetAllAsync()
        {
            return Repository.GetAllListAsync();
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(FormConfiguration item)
        {
            return Task.FromResult<IConfigurationItemDto>(ObjectMapper.Map<FormConfigurationDto>(item));
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
            await Repository.InsertAsync(exposedConfig);

            var exposedRevision = exposedConfig.MakeNewRevision();

            await MapRevisionAsync(srcRevision, exposedRevision);
            exposedRevision.VersionNo = 1;
            exposedRevision.VersionName = null;            

            await RevisionRepository.InsertAsync(exposedRevision);
            await Repository.UpdateAsync(exposedConfig);

            await UnitOfWorkManager.Current.SaveChangesAsync();

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

            /* TODO: V1 review. Implement templates processing, combine with new templating engine
            var template = input.TemplateId.HasValue
                ? await Repository.GetAsync(input.TemplateId.Value)
                : null;
            */

            var form = new FormConfiguration {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            form.Origin = form;

            await Repository.InsertAsync(form);

            var revision = form.MakeNewRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            revision.Markup = string.Empty;
            revision.IsTemplate = false;
            form.Normalize();

            await RevisionRepository.InsertAsync(revision);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return form;
        }

        protected override Task CopyRevisionPropertiesAsync(FormConfigurationRevision source, FormConfigurationRevision destination)
        {
            destination.Markup = source.Markup;
            destination.IsTemplate = source.IsTemplate;

            return Task.CompletedTask;
        }

        protected override async Task AfterItemDuplicatedAsync(FormConfiguration item, FormConfiguration duplicate)
        {
            await _permissionedObjectManager.CopyAsync(
                GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                GetFormPermissionedObjectName(duplicate.Module?.Name, duplicate.Name),
                ShaPermissionedObjectsTypes.Form
            );
        }
    }
}