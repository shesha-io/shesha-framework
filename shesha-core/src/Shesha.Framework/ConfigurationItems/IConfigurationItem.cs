using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Interface of the configuration item
    /// </summary>
    public interface IConfigurationItem: IEntity<Guid>, IFullAudited
    {
        /// <summary>
        /// Item name
        /// </summary>
        [StringLength(200)]
        [Display(Name = "Name", Description = "Name of the configuration item. Unique within the module.")]
        string Name { get; set; }

        /// <summary>
        /// Module
        /// </summary>
        Module Module { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        [Display(Name = "Version no")]
        int VersionNo { get; set; }

        /// <summary>
        /// Version status (Draft/In Progress/Live etc.)
        /// </summary>
        [Display(Name = "Version status", Description = "Draft/In Progress/Live etc.")]
        ConfigurationItemVersionStatus VersionStatus { get; set; }

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        ConfigurationItem Origin { get; set; }

        /// <summary>
        /// If true, indicates that this is a last version of the configuration item
        /// </summary>
        bool IsLast { get; }
    }
}
