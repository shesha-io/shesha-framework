using Shesha.ConfigurationItems.Models;
using System;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Cache
{
    /// <summary>
    /// Configuration item client-side cache
    /// </summary>
    public interface IConfigurationItemClientSideCache
    {
        /// <summary>
        /// Get cached MD5 for configuration item with specified name
        /// </summary>
        /// <param name="itemType">Type of configuration item</param>
        /// <param name="applicationKey"></param>
        /// <param name="module">Module name</param>
        /// <param name="name">Item Name</param>
        /// <param name="mode">View mode</param>
        /// <returns></returns>
        Task<string> GetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode);

        /// <summary>
        /// Set cached MD5 for configuration item with specified name
        /// </summary>
        /// <param name="itemType">Type of configuration item</param>
        /// <param name="applicationKey"></param>
        /// <param name="module">Module name</param>
        /// <param name="name">Item Name</param>
        /// <param name="mode">View mode</param>
        /// <param name="md5">MD5 value</param>
        /// <returns></returns>
        Task SetCachedMd5Async(string itemType, string applicationKey, string module, string name, ConfigurationItemViewMode mode, string md5);

        /// <summary>
        /// Get cached MD5 for configuration item with specified id
        /// </summary>
        /// <param name="itemType">Type of configuration item</param>
        /// <param name="id">Item id</param>
        /// <returns></returns>
        Task<string> GetCachedMd5Async(string itemType, Guid id);

        /// <summary>
        /// Set cached MD5 for configuration item with specified name
        /// </summary>
        /// <param name="itemType">Type of configuration item</param>
        /// <param name="id">Item id</param>
        /// <param name="md5">MD5 value</param>
        /// <returns></returns>
        Task SetCachedMd5Async(string itemType, Guid id, string md5);

        /// <summary>
        /// Clear cache
        /// </summary>
        /// <returns></returns>
        Task ClearAsync();
    }
}
