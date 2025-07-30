using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Form configuration export
    /// </summary>
    public class FormConfigurationExport: IFormConfigurationExport, ITransientDependency
    {
        private readonly IRepository<FormConfiguration, Guid> _formConfigRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public FormConfigurationExport(
            IRepository<FormConfiguration, Guid> formConfigRepo,
            IPermissionedObjectManager permissionedObjectManager
        )
        {
            _formConfigRepo = formConfigRepo;
            _permissionedObjectManager = permissionedObjectManager;
        }

        public string ItemType => FormConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id) 
        {
            var form = await _formConfigRepo.GetAsync(id);
            return await ExportItemAsync(form);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is FormConfiguration form))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(FormConfiguration)}, actual: {item.GetType().FullName}");

            var permission = await _permissionedObjectManager.GetOrNullAsync(
                FormManager.GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                ShaPermissionedObjectsTypes.Form
            );

            var result = new DistributedFormConfiguration
            {
                Id = form.Id,
                Name = form.Name,
                ModuleName = form.Module?.Name,
                ItemType = form.ItemType,

                Label = form.Label,
                Description = form.Description,
                OriginId = form.Origin?.Id,
                BaseItem = form.BaseItem?.Id,
                VersionNo = form.VersionNo,
                VersionStatus = form.VersionStatus,
                ParentVersionId = form.ParentVersion?.Id,
                Suppress = form.Suppress,

                // form specific properties
                Markup = form.Markup,
                ModelType = form.ModelType,
                TemplateId = form.Template?.Id,
                IsTemplate = form.IsTemplate,
                Access = permission?.Access,
                Permissions = permission?.Permissions,
                ConfigurationForm = form.ConfigurationForm,
                GenerationLogicTypeName = form.GenerationLogicTypeName,
                GenerationLogicExtensionJson = form.GenerationLogicExtensionJson,
                PlaceholderIcon = form.PlaceholderIcon
            };

            return result;
        }

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}
