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
    public abstract class ConfigurableItemExportBase<TItem, TRevision, TDistributedItem>
        where TItem : ConfigurationItem<TRevision>, new()
        where TRevision : ConfigurationItemRevision, new()
        where TDistributedItem : DistributedConfigurableItemBase, new()
    {
        public IRepository<TItem, Guid> Repository { get; set; }
        public IRepository<TRevision, Guid> RevisionRepository { get; set; }

        /// <summary>
        /// Check is item can be exported
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public virtual Task<bool> CanExportItemAsync(ConfigurationItem item) 
        {
            var canEdport = item is IDistributedConfigurationItem ci && ci.HasRevision;
            return Task.FromResult(canEdport);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await Repository.GetAsync(id);
            return await ExportItemAsync(item);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item) 
        {
            var typedItem = CastItem<TItem, ConfigurationItem>(item);

            var revision = typedItem.LatestRevision;
            var distributedItem = GetBaseDistributedItem(typedItem, revision);
            await MapCustomPropsAsync(typedItem, revision, distributedItem);

            return distributedItem;
        }

        protected abstract Task MapCustomPropsAsync(TItem item, TRevision revision, TDistributedItem result);

        protected TDistributedItem GetBaseDistributedItem(TItem item, TRevision revision)
        {
            return new TDistributedItem {
                Id = item.Id,
                Name = item.Name,
                ModuleName = item.Module?.Name,
                ItemType = item.ItemType,
                FrontEndApplication = item.Application?.AppKey,

                OriginId = item.Origin?.Id,
                Suppress = item.Suppress,

                Label = revision.Label,
                Description = revision.Description,
            };
        }

        //public abstract Task<TDistributedItem> ExportAsync(TItem item);

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
