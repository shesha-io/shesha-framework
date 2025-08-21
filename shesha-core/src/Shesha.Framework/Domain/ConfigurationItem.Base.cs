using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Shesha.ConfigurationItems;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration Item
    /// </summary>
    [Discriminator(DiscriminatorColumn = "item_type")]
    [Table("configuration_items", Schema = "frwk")]
    [SnakeCaseNaming]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ConfigurationItem : FullAuditedEntity<Guid>, IMayHaveFrontEndApplication, IConfigurationItem
    {
        [ReadonlyProperty]
        [MaxLength(50)]
        public virtual string ItemType { get; set; } = string.Empty;

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        public virtual ConfigurationItem? Origin { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        [MaxLength(200)]
        [Audited]
        [Display(Name = "Name", Description = "Name of the configuration item. Unique within the module.")]
        public virtual string Name { get; set; } = string.Empty;

        /// <summary>
        /// Module
        /// </summary>
        public virtual Module? Module { get; set; }

        /// <summary>
        /// If true, it means that the item will not be visible to Config or End-users/Admins.
        /// </summary>
        public virtual bool Suppress { get; set; }

        /// <summary>
        /// Application the item belongs to
        /// </summary>
        public virtual FrontEndApp? Application { get; set; }

        /// <summary>
        /// Folder
        /// </summary>
        [ForeignKey("folder_id")]
        public virtual ConfigurationItemFolder? Folder { get; set; }

        /// <summary>
        /// Surface Status: Visible(config item is visible but not overriden); Overridden
        /// </summary>
        public virtual RefListSurfaceStatus? SurfaceStatus { get; set; }

        /// <summary>
        /// Base item. Is used if the current item is inherited from another one
        /// </summary>
        [Display(Name = "Exposed From", Description = "Is used when configuration item is exposed from base module")]
        public virtual ConfigurationItem? ExposedFrom { get; set; }

        /// <summary>
        /// Revision of base item
        /// </summary>
        [Display(Name = "Exposed From Revision", Description = "Is used when configuration item is exposed from base module")]
        public virtual ConfigurationItemRevision? ExposedFromRevision { get; set; }

        public virtual void Normalize()
        {
            // If Origin is not specified - add self reference
            if (Origin == null)
                Origin = this;
        }
        
        /*
        [ReadonlyProperty]
        public virtual Guid? ActiveRevisionId { get; protected set; }
        [ReadonlyProperty]
        public virtual Guid? LatestRevisionId { get; protected set; }
        */

        public override string ToString()
        {
            return Module != null
                ? $"{ItemType}:{Module.Name}/{Name}"
                : $"{ItemType}:{Name}";

        }
    }
}