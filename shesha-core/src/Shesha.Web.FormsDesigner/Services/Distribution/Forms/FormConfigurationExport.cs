using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Form configuration export
    /// </summary>
    public class FormConfigurationExport : ConfigurableItemExportBase<FormConfiguration, FormConfigurationRevision, DistributedFormConfiguration>, IFormConfigurationExport, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public FormConfigurationExport(
            IPermissionedObjectManager permissionedObjectManager
        )
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public string ItemType => FormConfiguration.ItemTypeName;

        protected override async Task MapCustomPropsAsync(FormConfiguration item, FormConfigurationRevision revision, DistributedFormConfiguration result)
        {
            var permission = await _permissionedObjectManager.GetOrNullAsync(
                FormManager.GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                ShaPermissionedObjectsTypes.Form
            );

            var result = new DistributedFormConfiguration
            {
                Id = form.Id,
                Name = form.Name,
                ModuleName = form.Module?.Name,
                ItemType = form.ItemType,

                OriginId = form.Origin?.Id,
                Suppress = form.Suppress,

                // form specific properties
                Label = form.Revision.Label,
                Description = form.Revision.Description,
                Markup = form.Revision.Markup,
                ModelType = form.Revision.ModelType,
                //TemplateId = form.Revision.Template?.Id,
                IsTemplate = form.Revision.IsTemplate,

                Access = permission?.Access,
                Permissions = permission?.Permissions,

                ConfigurationForm = form.Revision.ConfigurationForm,
                GenerationLogicTypeName = form.Revision.GenerationLogicTypeName,
                GenerationLogicExtensionJson = form.Revision.GenerationLogicExtensionJson,
                PlaceholderIcon = form.Revision.PlaceholderIcon
            };

            return result;
        }

            result.Access = permission?.Access;
            result.Permissions = permission?.Permissions;
        }
    }
}
