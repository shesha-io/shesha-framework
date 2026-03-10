using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using JetBrains.Annotations;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration Item
    /// </summary>
    [Discriminator(DiscriminatorColumn = "item_type")]
    [Table("configuration_items", Schema = "frwk")]
    [SnakeCaseNaming]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ConfigurationItem : FullAuditedEntity<Guid>, IMayHaveFrontEndApplication
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
        /// Label of the configuration item
        /// </summary>
        [MaxLength(200)]
        [Display(Name = "Label", Description = "Label of the item, can be used in lists as a user friendly name")]
        public virtual string? Label { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        [MaxLength(int.MaxValue)]
        [DataType(DataType.MultilineText)]
        public virtual string? Description { get; set; }

        /// <summary>
        /// Most recent revision. Is used for performance boosting
        /// </summary>
        [CascadeUpdateRules(false, false)]
        public virtual ConfigurationItemRevision LatestRevision { get; set; }

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

        public virtual bool IsCodeBased { get; set; }
        public virtual bool IsCodegenPending { get; set; }
        public virtual Guid? LatestImportedRevisionId { get; set; }
        [ReadonlyProperty]
        public virtual bool IsUpdated { get; protected set; }
        [ReadonlyProperty]
        public virtual bool IsExposed { get; protected set; }

        public virtual void Normalize()
        {
            // If Origin is not specified - add self reference
            if (Origin == null)
                Origin = this;
        }

        [MemberNotNull(nameof(LatestRevision))]
        public virtual ConfigurationItemRevision MakeNewRevision(ConfigurationItemRevisionCreationMethod creationMethod)
        {
            var prevRevision = LatestRevision;
            var newVersionNo = prevRevision != null
                ? prevRevision.VersionNo + 1
                : 1;
            LatestRevision = new ConfigurationItemRevision()
            {
                ConfigurationItem = this,
                VersionNo = newVersionNo,
                ParentRevision = prevRevision,
                CreationMethod = creationMethod,
            };
            return LatestRevision;
        }

        public override string ToString()
        {
            return Module != null
                ? $"{ItemType}:{Module.Name}/{Name}"
                : $"{ItemType}:{Name}";

        }

        /// <summary>
        /// Default constructor
        /// </summary>
        [UsedImplicitly]
        public ConfigurationItem()
        {

        }

        public virtual string FullName => Module != null
                ? $"{Module.Name}.{Name}"
                : Name;
    }
}