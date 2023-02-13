using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Interface of the configuration item
    /// </summary>
    public interface IConfigurationItem: IEntity<Guid>
    {
        /// <summary>
        /// Configuration item type
        /// </summary>
        string ItemType { get; }

        /// <summary>
        /// Configuration item
        /// </summary>
        ConfigurationItem Configuration { get; set; }

        /// <summary>
        /// Get dependencies of current configuration item
        /// </summary>
        /// <returns></returns>
        Task<IList<ConfigurationItemBase>> GetDependenciesAsync();
    }
}
