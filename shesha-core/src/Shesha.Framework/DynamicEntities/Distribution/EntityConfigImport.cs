using Abp.Dependency;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.DynamicEntities.Distribution.Dto;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class EntityConfigImport : IEntityConfigImport, ITransientDependency
    {
        public string ItemType => EntityConfig.ItemTypeName;

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedEntityConfig distributedEntityConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedEntityConfig)}. Actual type is {item.GetType().FullName}");

            return await ImportEntityConfigAsync(distributedEntityConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportEntityConfigAsync(DistributedEntityConfig item, IConfigurationItemsImportContext context) 
        {
            throw new NotImplementedException();
        }

        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedEntityConfig>(json);
            }
        }
    }
}
