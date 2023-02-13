using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Web.FormsDesigner.Domain;
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

        public FormConfigurationExport(IRepository<FormConfiguration, Guid> formConfigRepo)
        {
            _formConfigRepo = formConfigRepo;
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

            if (form.Configuration == null)
                throw new ConfigurationMissingException(form);

            var result = new DistributedFormConfiguration
            {
                Id = form.Id,
                Name = form.Configuration.Name,
                ModuleName = form.Configuration.Module?.Name,
                ItemType = form.Configuration.ItemType,

                Label = form.Configuration.Label,
                Description = form.Configuration.Description,
                OriginId = form.Configuration.Origin?.Id,
                BaseItem = form.Configuration.BaseItem?.Id,
                VersionNo = form.Configuration.VersionNo,
                VersionStatus = form.Configuration.VersionStatus,
                ParentVersionId = form.Configuration.ParentVersion?.Id,
                Suppress = form.Configuration.Suppress,

                // form specific properties
                Markup = form.Markup,
                ModelType = form.ModelType,
                TemplateId = form.Template?.Id,
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
