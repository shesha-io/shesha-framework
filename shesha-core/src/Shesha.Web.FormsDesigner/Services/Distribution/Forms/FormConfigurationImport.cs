using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Form configuration import
    /// </summary>
    public class FormConfigurationImport : ConfigurationItemImportBase<FormConfiguration, DistributedFormConfiguration>, IFormConfigurationImport, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        /// <summary>
        /// Default constructor
        /// </summary>
        public FormConfigurationImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo, 
            IRepository<FormConfiguration, Guid> repository,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(repository, moduleRepo, frontEndAppRepo)
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        /// <summary>
        /// Iten type
        /// </summary>
        public string ItemType => FormConfiguration.ItemTypeName;

        protected override Task AfterImportAsync(FormConfiguration item, DistributedFormConfiguration distributedItem, IConfigurationItemsImportContext context)
        {
            return SetPermissionsAsync(distributedItem, item);
        }

        private async Task SetPermissionsAsync(DistributedFormConfiguration item, FormConfiguration form)
        {
            // add only if permissions is available and access is not Inherited
            if (item.Access != null && item.Access > Shesha.Domain.Enums.RefListPermissionedAccess.Inherited)
            {
                var permisson = new PermissionedObjectDto
                {
                    Object = FormManager.GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                    Name = $"{form.Module?.Name}.{form.Name}",
                    Module = form.Module?.Name,
                    ModuleId = form.Module?.Id,
                    Type = ShaPermissionedObjectsTypes.Form,
                    Access = item.Access,
                    Permissions = item.Permissions,
                };

                await _permissionedObjectManager.SetAsync(permisson);
            }
        }

        protected override Task<bool> CustomPropsAreEqualAsync(FormConfiguration item, DistributedFormConfiguration distributedItem)
        {
            var equals = item.Markup == distributedItem.Markup &&
                item.ModelType == distributedItem.ModelType &&
                item.IsTemplate == distributedItem.IsTemplate &&
                item.Template?.Id == distributedItem.TemplateId &&
                item.ConfigurationForm == distributedItem.ConfigurationForm &&
                item.GenerationLogicTypeName == distributedItem.GenerationLogicTypeName &&
                item.GenerationLogicExtensionJson == distributedItem.GenerationLogicExtensionJson &&
                item.PlaceholderIcon == distributedItem.PlaceholderIcon;

            return Task.FromResult(equals);
        }

        protected override Task MapCustomPropsToItemAsync(FormConfiguration item, DistributedFormConfiguration distributedItem)
        {
            item.Label = distributedItem.Label;
            item.Description = distributedItem.Description;
            item.Markup = distributedItem.Markup;
            item.ModelType = distributedItem.ModelType;
            item.IsTemplate = distributedItem.IsTemplate;
            item.ConfigurationForm = distributedItem.ConfigurationForm;
            item.GenerationLogicTypeName = distributedItem.GenerationLogicTypeName;
            item.GenerationLogicExtensionJson = distributedItem.GenerationLogicExtensionJson;
            item.PlaceholderIcon = distributedItem.PlaceholderIcon;
            return Task.CompletedTask;
        }
    }
}