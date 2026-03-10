using Shesha.Domain;
using Shesha.Dto.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    public interface IConfigurationItemHelper
    {
        /// <summary>
        /// Get configuration item manager for the specified item
        /// </summary>
        /// <param name="item">Configuration item</param>
        IConfigurationItemManager GetManager(ConfigurationItem item);

        /// <summary>
        /// Get configuration item manager for the specified item type
        /// </summary>
        /// <param name="discriminator">Item type (discriminator) of the configuration item</param>
        IConfigurationItemManager GetManagerByDiscriminator(string discriminator);

        /// <summary>
        /// Get C# type of the configuration item by discriminator
        /// </summary>
        /// <param name="discriminator">Discriminator value</param>
        Type GetTypeByDiscriminator(string discriminator);

        /// <summary>
        /// Get string item type of the configuration item by discriminator
        /// </summary>
        /// <param name="discriminator"></param>
        /// <returns></returns>
        string GetItemTypeByDiscriminator(string discriminator);

        /// <summary>
        /// Get discriminator by configuration item type
        /// </summary>
        /// <param name="itemType"></param>
        /// <returns></returns>
        string GetDiscriminator(Type itemType);

        /// <summary>
        /// Get available configuration item types
        /// </summary>
        Task<List<IConfigurationItemTypeDto>> GetAvailableItemTypesAsync();
    }
}
