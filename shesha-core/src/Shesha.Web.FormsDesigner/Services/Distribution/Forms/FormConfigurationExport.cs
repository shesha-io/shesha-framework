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
    public class FormConfigurationExport : ConfigurableItemExportBase<FormConfiguration, DistributedFormConfiguration>, IFormConfigurationExport, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public FormConfigurationExport(
            IPermissionedObjectManager permissionedObjectManager
        )
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public string ItemType => FormConfiguration.ItemTypeName;

        protected override async Task MapCustomPropsAsync(FormConfiguration item, DistributedFormConfiguration result)
        {
            var permission = await _permissionedObjectManager.GetOrNullAsync(
                FormManager.GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                ShaPermissionedObjectsTypes.Form
            );

            result.Markup = item.Markup;
            result.ModelType = item.ModelType;
            result.IsTemplate = item.IsTemplate;
            result.TemplateId = item.Template?.Id;
            result.Access = permission?.Access;
            result.Permissions = permission?.Permissions;
            result.ConfigurationForm = item.ConfigurationForm;
            result.GenerationLogicTypeName = item.GenerationLogicTypeName;
            result.GenerationLogicExtensionJson = item.GenerationLogicExtensionJson;
            result.PlaceholderIcon = item.PlaceholderIcon;
        }
    }
}
