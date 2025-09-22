using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Reference list item
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.ReferenceListItem", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [SnakeCaseNaming]
    [Table("reference_list_items", Schema = "frwk")]
    public class ReferenceListItem : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// Item name
        /// </summary>
        [Required(AllowEmptyStrings = false), MaxLength(300)]
        [Display(Name = "Name")]
        public virtual string Item { get; set; } = string.Empty;

        /// <summary>
        /// Item value
        /// </summary>
        [Range(0, Int64.MaxValue)]
        [Display(Name = "Value")]
        public virtual Int64 ItemValue { get; set; } = 0;

        /// <summary>
        /// Description
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string Description { get; set; } = string.Empty;

        /// <summary>
        /// Order index
        /// </summary>
        [Display(Name = "Order Index")]
        public virtual Int64 OrderIndex { get; set; } = 0;

        /// <summary>
        /// If true, indicates that the application logic references the value or name of this item and should therefore not be changed.
        /// </summary>
        [Display(Name = "Hard linked to application", Description = "If true, indicates that the application logic references the value or name of this item and should therefore not be changed.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        /// <summary>
        /// Reference List current item belongs to
        /// </summary>
        [Required]
        public required virtual ReferenceList ReferenceList { get; set; }

        /// <summary>
        /// Parent item
        /// </summary>
        public virtual ReferenceListItem? Parent { get; set; }

        /// <summary>
        /// Color associated with the item
        /// </summary>
        [MaxLength(50)]
        public virtual string Color { get; set; } = string.Empty;

        /// <summary>
        /// Icon associated with the item
        /// </summary>
        [MaxLength(50)]
        public virtual string Icon { get; set; } = string.Empty;

        /// <summary>
        /// Short alias
        /// </summary>
        [MaxLength(50)]
        public virtual string ShortAlias { get; set; } = string.Empty;

        /// <summary>
        /// Set <see cref="HardLinkToApplication"/> flag
        /// </summary>
        /// <param name="value"></param>
        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }

        /// <summary>
        /// Tenent Id
        /// </summary>
        public virtual int? TenantId { get; set; }
    }
}