using Shesha.Domain;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configurable item export
    /// </summary>
    public interface IConfigurableItemExport
    {
        /// <summary>
        /// Configurable Item type supported by the current export process
        /// </summary>
        string ItemType { get; }

        /// <summary>
        /// Export configurable item by id
        /// </summary>
        Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id);

        /// <summary>
        /// Export configurable item
        /// </summary>
        Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item);

        /// <summary>
        /// Export configurable item to JSON
        /// </summary>
        Task<string> ExportItemToJsonAsync(ConfigurationItem item);

        /// <summary>
        /// Write item to json
        /// </summary>
        /// <returns></returns>
        Task WriteItemToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream);

        /// <summary>
        /// Check is item can be exported
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        Task<bool> CanExportItemAsync(ConfigurationItem item);
    }

    public interface IConfigurableItemExport<TItem>: IConfigurableItemExport where TItem: ConfigurationItem
    { 

    }
}
