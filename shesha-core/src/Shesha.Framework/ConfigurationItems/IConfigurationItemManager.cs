﻿using Shesha.ConfigurationItems.Models;
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
        /// Map item to details DTO
        /// </summary>
        Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItem item);

        /// <summary>
        /// Get client-side cache MD5
        /// </summary>
        /// <returns></returns>
        Task<string> GetCacheMD5Async(IConfigurationItemDto dto);

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

        /// <summary>
        /// Checks is the current user has access to the item
        /// </summary>
        /// <param name="module"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        Task<bool> CurrentUserHasAccessToAsync(string module, string name);
    }
}