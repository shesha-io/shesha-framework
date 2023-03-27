using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
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
        public Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is FormConfiguration form))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(FormConfiguration)}, actual: {item.GetType().FullName}");

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
            };

            return Task.FromResult<DistributedConfigurableItemBase>(result);
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
