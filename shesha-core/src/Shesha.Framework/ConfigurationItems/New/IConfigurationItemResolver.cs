using System.ComponentModel;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.New
{
    /// <summary>
    /// Configuration Items resolver. Searches for configuration items taking modules hierarchy into account
    /// </summary>
    public interface IConfigurationItemResolver
    {
        /// <summary>
        /// Get configuration item by name taking into account module inheritance
        /// </summary>
        Task<TItem> GetItemAsync<TItem>(string module, string name) where TItem: IConfigurationItem;
    }
}
