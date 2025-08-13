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
    public class FormConfigurationExport: ConfigurableItemExportBase<FormConfiguration, FormConfigurationRevision, DistributedFormConfiguration>, IFormConfigurationExport, ITransientDependency
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
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item) 
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
