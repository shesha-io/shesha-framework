using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.ConfigurationItems
{
    /// <summary>
    /// Configuration Item
    /// </summary>
    [Discriminator(DiscriminatorColumn = "ItemType")]
    public class ConfigurationItem : FullAuditedEntity<Guid, User>, IMayHaveTenant, IMayHaveFrontEndApplication
    {
        [ReadonlyProperty]
        public virtual string ItemType { get; set; }

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        public virtual ConfigurationItem Origin { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        [StringLength(200)]
        [Display(Name = "Name", Description = "Name of the configuration item. Unique within the module.")]
        public virtual string Name { get; set; }

        /// <summary>
        /// Label of the con
        /// </summary>
        [StringLength(200)]
        [Display(Name = "Label", Description = "Label of the item, can be used in lists as a user friendly name")]
        public virtual string Label { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        [StringLength(int.MaxValue)]
        [DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }
        
        /// <summary>
        /// Module
        /// </summary>
        public virtual Module Module { get; set; }

        /// <summary>
        /// Base item. Is used if the current item is inherited from another one
        /// </summary>
        [Display(Name = "Base item", Description = "Is used if the current item is inherited from another one")]
        public virtual ConfigurationItem BaseItem { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        [Display(Name = "Version no")]
        public virtual int VersionNo { get; set; }

        /// <summary>
        /// Version status (Draft/In Progress/Live etc.)
        /// </summary>
        [Display(Name = "Version status", Description = "Draft/In Progress/Live etc.")]
        public virtual ConfigurationItemVersionStatus VersionStatus { get; set; }

        /// <summary>
        /// Parent version. Note: version may have more than one child versions (e.g. new version was created and then cancelled, in this case a new version should be created in the same parent)
        /// </summary>
        public virtual ConfigurationItem ParentVersion { get; set; }

        /// <summary>
        /// Import session that created this configuration item
        /// </summary>
        public virtual ImportResult CreatedByImport { get; set; }

        //[NotMapped]
        //public virtual ConfigurationItemBase Owner { get; set; }

        /// <summary>
        /// Tenant ID or null for no tenant
        /// </summary>
        public virtual int? TenantId { get; set; }

        /// <summary>
        /// If true, indicates that this is a last version of the configuration item
        /// </summary>
        [ReadonlyProperty(Insert = true /*enabled to pass null check*/)]
        public virtual bool IsLast { get; protected set; }

        /// <summary>
        /// If true, it means that the item will not be visible to Config or End-users/Admins.
        /// </summary>
        public virtual bool Suppress { get; set; }

        /// <summary>
        /// For unit tests only
        /// </summary>
        public virtual void SetIsLast(bool value) 
        {
            IsLast = value;
        }

        /// <summary>
        /// Application the item belongs to
        /// </summary>
        public virtual FrontEndApp Application { get; set; }
    }
}
