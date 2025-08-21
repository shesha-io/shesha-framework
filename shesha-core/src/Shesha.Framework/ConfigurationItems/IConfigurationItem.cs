using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain;
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

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
        [MaxLength(200)]
        [Display(Name = "Name", Description = "Name of the configuration item. Unique within the module.")]
        string Name { get; set; }

        /// <summary>
        /// Module
        /// </summary>
        Module? Module { get; set; }

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        ConfigurationItem? Origin { get; set; }
    }

    public interface IDistributedConfigurationItem 
    {
        /// <summary>
        /// If true, indicated that item has at least one revision
        /// </summary>
        bool HasRevision { get; }

        /// <summary>
        /// Most recent revision. Is used for performance boosting
        /// </summary>
        ConfigurationItemRevision? GetLatestRevision();
    }


    public interface IConfigurationItem<TRevision> : IConfigurationItem, IDistributedConfigurationItem where TRevision: ConfigurationItemRevision
    {
        /// <summary>
        /// Active (published) revision. Is used when drafts mode is enabled
        /// </summary>
        TRevision? ActiveRevision { get; }

        /// <summary>
        /// Most recent revision. Is used for performance boosting
        /// </summary>
        TRevision? LatestRevision { get; }

        [MemberNotNull(nameof(LatestRevision))]
        TRevision EnsureLatestRevision();

        [MemberNotNull(nameof(LatestRevision))]
        TRevision MakeNewRevision();
    }
}