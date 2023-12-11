using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using System;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Interface of the Configuration Item Manager
    /// </summary>
    public interface IConfigurationItemManager<TItem>: IConfigurationItemManager where TItem : ConfigurationItemBase
    {
        /// <summary>
        /// Update version status
        /// </summary>
        /// <param name="item">Configuration item</param>
        /// <param name="status">New status</param>
        /// <returns></returns>
        Task UpdateStatusAsync(TItem item, ConfigurationItemVersionStatus status);

        /// <summary>
        /// Copy configuration item
        /// </summary>
        /// <param name="item">Source item to copy</param>
        /// <param name="input">Copy arguments</param>
        /// <returns></returns>
        Task<TItem> CopyAsync(TItem item, CopyItemInput input);

        /// <summary>
        /// Cancel version
        /// </summary>
        Task CancelVersionAsync(TItem item);

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
    }

    public interface IConfigurationItemManager
    {
        /// <summary>
        /// Configurable Item type supported by the current manager
        /// </summary>
        Type ItemType { get; }

        /// <summary>
        /// Update version status
        /// </summary>
        /// <param name="item">Configuration item</param>
        /// <param name="status">New status</param>
        /// <returns></returns>
        Task UpdateStatusAsync(ConfigurationItemBase item, ConfigurationItemVersionStatus status);

        /// <summary>
        /// Copy configuration item
        /// </summary>
        /// <param name="item">Source item to copy</param>
        /// <param name="input">Copy arguments</param>
        /// <returns></returns>
        Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input);

        /// <summary>
        /// Cancel version
        /// </summary>
        Task CancelVersoinAsync(ConfigurationItemBase item);

        /// <summary>
        /// Move item to another module
        /// </summary>
        Task MoveToModuleAsync(ConfigurationItemBase item, MoveItemToModuleInput input);

        /// <summary>
        /// Create new version of the item
        /// </summary>
        Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item);

        /// <summary>
        /// Delete all versions of item specified <paramref name="item"/>
        /// </summary>
        Task DeleteAllVersionsAsync(ConfigurationItemBase item);

        /// <summary>
        /// Map item to details DTO
        /// </summary>
        Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item);
    }
}