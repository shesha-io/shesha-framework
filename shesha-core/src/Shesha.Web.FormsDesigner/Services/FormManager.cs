using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.Permissions;
using Shesha.Web.FormsDesigner.Dtos;
using Shesha.Web.FormsDesigner.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Form manager
    /// </summary>
    public class FormManager : ConfigurationItemManager<FormConfiguration>, IFormManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        
        public FormManager(IPermissionedObjectManager permissionedObjectManager) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

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
                ? await Repository.GetAsync(input.TemplateId.Value)
                : null;
                
            var additionalData = new FormCreationData
            {
                FormInput = input,
                Template = template
            };

            // Use the overload that accepts additional data
            return await base.CreateItemAsync(baseInput, additionalData);
        }

        protected override Task HandleAdditionalPropertiesAsync(FormConfiguration form, object additionalData)
        {
            if (additionalData is FormCreationData data)
            {
                form.Markup = data.FormInput?.Markup ?? string.Empty;
                form.IsTemplate = false;
                form.ModelType = data.FormInput?.ModelType;
                form.GenerationLogicExtensionJson = data.FormInput?.GenerationLogicExtensionJson;
                form.Template = data.Template;
            }
            return Task.CompletedTask;
        }

        protected override Task CopyItemPropertiesAsync(FormConfiguration source, FormConfiguration destination)
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

        public override async Task<IConfigurationItemDto> MapToDtoAsync(FormConfiguration item)
        {
            var dto = new FormConfigurationDto {
                Id = item.Id,
                ModuleId = item.Module?.Id,
                OriginId = item.Origin?.Id,
                Module = item.Module?.Name,
                Name = item.Name,
                Label = item.Label,
                Description = item.Description,
                //
                Markup = item.Markup,
                ModelType = item.ModelType,
            };
            var permission = await _permissionedObjectManager.GetOrNullAsync(
                GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                ShaPermissionedObjectsTypes.Form
            );
            if (permission != null && permission.Access > RefListPermissionedAccess.Inherited)
            {
                dto.Access = permission.Access;
                dto.Permissions = permission.Permissions;
            }

            return dto;
        }
    }
}