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
        public Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is ConfigurableComponent component))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ConfigurableComponent)}, actual: {item.GetType().FullName}");

            var result = new DistributedConfigurableComponent
            {
                Id = component.Id,
                Name = component.Name,
                ModuleName = component.Module?.Name,
                FrontEndApplication = component.Application?.AppKey,
                ItemType = component.ItemType,

                Label = component.Label,
                Description = component.Description,
                OriginId = component.Origin?.Id,
                BaseItem = component.BaseItem?.Id,
                VersionNo = component.VersionNo,
                VersionStatus = component.VersionStatus,
                ParentVersionId = component.ParentVersion?.Id,
                Suppress = component.Suppress,

                // form specific properties
                Settings = component.Settings,
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
