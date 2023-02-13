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
    /// Configurable component export
    /// </summary>
    public class ConfigurableComponentExport: IConfigurableComponentExport, ITransientDependency
    {
        private readonly IRepository<ConfigurableComponent, Guid> _componentRepo;

        public ConfigurableComponentExport(IRepository<ConfigurableComponent, Guid> formConfigRepo)
        {
            _componentRepo = formConfigRepo;
        }

        public string ItemType => ConfigurableComponent.ItemTypeName;

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id) 
        {
            var form = await _componentRepo.GetAsync(id);
            return await ExportItemAsync(form);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is ConfigurableComponent component))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ConfigurableComponent)}, actual: {item.GetType().FullName}");

            if (component.Configuration == null)
                throw new ConfigurationMissingException(component);

            var result = new DistributedConfigurableComponent
            {
                Id = component.Id,
                Name = component.Configuration.Name,
                ModuleName = component.Configuration.Module?.Name,
                FrontEndApplication = component.Configuration.Application?.AppKey,
                ItemType = component.Configuration.ItemType,

                Label = component.Configuration.Label,
                Description = component.Configuration.Description,
                OriginId = component.Configuration.Origin?.Id,
                BaseItem = component.Configuration.BaseItem?.Id,
                VersionNo = component.Configuration.VersionNo,
                VersionStatus = component.Configuration.VersionStatus,
                ParentVersionId = component.Configuration.ParentVersion?.Id,
                Suppress = component.Configuration.Suppress,

                // form specific properties
                Settings = component.Settings,
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
