using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Permissions;
using Shesha.Web.FormsDesigner.Models;
using System;
using System.Collections.Generic;
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

        public async Task<FormConfiguration> CreateFormAsync(CreateFormInput input)
        {
            // Convert CreateFormInput to base CreateItemInput and let base class handle common logic
            var baseInput = new CreateItemInput
            {
                Module = input.Module,
                Folder = input.Folder,
                OrderIndex = input.OrderIndex,
                Name = input.Name,
                Label = input.Label,
                Description = input.Description
            };

            // Create a strongly-typed container for form-specific data
            var template = input.TemplateId.HasValue 
                ? await RevisionRepository.GetAsync(input.TemplateId.Value)
                : null;
                
            var additionalData = new FormCreationData
            {
                FormInput = input,
                Template = template
            };

            // Use the overload that accepts additional data
            return await base.CreateItemAsync(baseInput, additionalData);
        }

        protected override Task HandleAdditionalPropertiesAsync(FormConfigurationRevision revision, object additionalData)
        {
            if (additionalData is FormCreationData data)
            {
                revision.Markup = data.FormInput?.Markup ?? string.Empty;
                revision.IsTemplate = false;
                revision.ModelType = data.FormInput?.ModelType;
                revision.GenerationLogicExtensionJson = data.FormInput?.GenerationLogicExtensionJson;
                revision.Template = data.Template;
            }
            return Task.CompletedTask;
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