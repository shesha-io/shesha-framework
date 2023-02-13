using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configurable item import
    /// </summary>
    public interface IConfigurableItemImport
    {
        /// <summary>
        /// Configurable Item type supported by the current import process
        /// </summary>
        string ItemType { get; }

        /// <summary>
        /// Import configuration item
        /// </summary>
        /// <param name="item">Item to be imported</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context);

        /// <summary>
        /// Read item from json
        /// </summary>
        /// <returns></returns>
        Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream);
    }
}
