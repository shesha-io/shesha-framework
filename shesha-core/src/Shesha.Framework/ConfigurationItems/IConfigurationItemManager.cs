using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using System;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Interface of the Configuration Item Manager
    /// </summary>
    public interface IConfigurationItemManager<TItem>: IConfigurationItemManager where TItem : ConfigurationItem
    {
        /// <summary>
        /// Copy configuration item
        /// </summary>
        /// <param name="item">Source item to copy</param>
        /// <param name="input">Copy arguments</param>
        /// <returns></returns>
        Task<TItem> CopyAsync(TItem item, CopyItemInput input);

        /// <summary>
        /// Move item to another module
        /// </summary>
        Task MoveToModuleAsync(TItem item, MoveItemToModuleInput input);

        /// <summary>
        /// Create new version of the item
        /// </summary>
        Task<TItem> CreateNewVersionAsync(TItem item);

        /// <summary>
        /// Delete all versions of item specified <paramref name="item"/>
        /// </summary>
        Task DeleteAllVersionsAsync(TItem item);

        /// <summary>
        /// Map item to details DTO
        /// </summary>
        Task<IConfigurationItemDto> MapToDtoAsync(TItem item);

        /// <summary>
        /// Expose item to a specified module
        /// </summary>
        /// <param name="item">Item to expose</param>
        /// <param name="module">Module to expose to</param>
        /// <returns></returns>
        Task<TItem> ExposeAsync(TItem item, Module module);

        /// <summary>
        /// Checks existence of item with name <paramref name="name"/> in a module <paramref name="module"/>
        /// </summary>
        /// <param name="name">Item name</param>
        /// <param name="module">Module</param>
        /// <returns></returns>
        Task<bool> ItemExistsAsync(string name, Module module);
    }

    public interface IConfigurationItemManager
    {
        /// <summary>
        /// Configurable Item type supported by the current manager
        /// </summary>
        Type ItemType { get; }

        /// <summary>
        /// Copy configuration item
        /// </summary>
        /// <param name="item">Source item to copy</param>
        /// <param name="input">Copy arguments</param>
        /// <returns></returns>
        [Obsolete]
        Task<ConfigurationItem> CopyAsync(ConfigurationItem item, CopyItemInput input);

        /// <summary>
        /// Move item to another module
        /// </summary>
        [Obsolete]
        Task MoveToModuleAsync(ConfigurationItem item, MoveItemToModuleInput input);

        /// <summary>
        /// Create new version of the item
        /// </summary>
        [Obsolete]
        Task<ConfigurationItem> CreateNewVersionAsync(ConfigurationItem item);

        /// <summary>
        /// Delete all versions of item specified <paramref name="item"/>
        /// </summary>
        [Obsolete]
        Task DeleteAllVersionsAsync(ConfigurationItem item);

        /// <summary>
        /// Map item to details DTO
        /// </summary>
        Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItem item);

        /// <summary>
        /// Expose item to a specified module
        /// </summary>
        /// <param name="item">Item to expose</param>
        /// <param name="module">Module to expose to</param>
        /// <returns></returns>
        Task<ConfigurationItem> ExposeAsync(ConfigurationItem item, Module module);

        Task<ConfigurationItem> GetItemAsync(string module, string name);

        Task<ConfigurationItem> CreateItemAsync(CreateItemInput input);

        /// <summary>
        /// Duplicate configuration item
        /// </summary>
        /// <param name="item">Source item to duplicate</param>
        Task<ConfigurationItem> DuplicateAsync(ConfigurationItem item);
    }
}