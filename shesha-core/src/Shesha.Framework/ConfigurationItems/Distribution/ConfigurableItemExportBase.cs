using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.Domain;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Base exporter of configurable items
    /// </summary>
    public abstract class ConfigurableItemExportBase<TItem, TDistributedItem>
        where TItem : ConfigurationItem, new()
        where TDistributedItem : DistributedConfigurableItemBase, new()
    {
        public IRepository<TItem, Guid> Repository { get; set; }

        /// <summary>
        /// Check is item can be exported
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public virtual Task<bool> CanExportItemAsync(ConfigurationItem item) 
        {
            return Task.FromResult(true);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await Repository.GetAsync(id);
            return await ExportItemAsync(item);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item) 
        {
            var typedItem = CastItem<TItem, ConfigurationItem>(item);

            var distributedItem = GetBaseDistributedItem(typedItem, typedItem);
            await MapCustomPropsAsync(typedItem, distributedItem);

            return distributedItem;
        }

        public async Task<string> ExportItemToJsonAsync(ConfigurationItem item) 
        { 
            var dto = await ExportItemAsync(item);
            var json = JsonConvert.SerializeObject(dto, Formatting.Indented);
            return json;
        }

        protected abstract Task MapCustomPropsAsync(TItem item, TDistributedItem result);

        protected TDistributedItem GetBaseDistributedItem(TItem item, ConfigurationItem revision)
        {
            return new TDistributedItem {
                Id = item.Id,
                Name = item.Name,
                ModuleName = item.Module?.Name,
                ItemType = item.ItemType,
                FrontEndApplication = item.Application?.AppKey,

                OriginId = item.Origin?.Id,
                Suppress = item.Suppress,

                Label = item.Label,
                Description = item.Description,
            };
        }

        public virtual async Task WriteToJsonAsync(TDistributedItem item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }

        public virtual async Task WriteItemToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream) 
        {
            var typed = CastItem<TDistributedItem, DistributedConfigurableItemBase>(item);
            await WriteToJsonAsync(typed, jsonStream);
        }

        private TExpected CastItem<TExpected, T>(T item) where T: class
        {
            if (item is not TExpected typedItem)
                throw new ArgumentException($"Unexpected type of item. Expected '{typeof(TItem).FullName}' actual '{item.GetType().FullName}'", nameof(item));
            return typedItem;
        }
    }
}
