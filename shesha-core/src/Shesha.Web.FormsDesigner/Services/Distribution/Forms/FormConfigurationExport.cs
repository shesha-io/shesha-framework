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

            result.Markup = revision.Markup;
            result.ModelType = revision.ModelType;
            result.IsTemplate = revision.IsTemplate;
            result.TemplateId = revision.Template?.Id;
            result.Access = permission?.Access;
            result.Permissions = permission?.Permissions;
            result.ConfigurationForm = revision.ConfigurationForm;
            result.GenerationLogicTypeName = revision.GenerationLogicTypeName;
            result.GenerationLogicExtensionJson = revision.GenerationLogicExtensionJson;
            result.PlaceholderIcon = revision.PlaceholderIcon;
        }
    }
}
