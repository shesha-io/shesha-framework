using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.ReferenceListItem", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ReferenceListItem : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        [Required(AllowEmptyStrings = false), StringLength(300)]
        //[EntityDisplayName]
        [Display(Name = "Name")]
        public virtual string Item { get; set; }

        [Range(0, Int64.MaxValue)]
        [Display(Name = "Value")]
        public virtual Int64 ItemValue { get; set; }
        [StringLength(int.MaxValue)]
        public virtual string Description { get; set; }
        [Display(Name = "Order Index")]
        public virtual Int64 OrderIndex { get; set; }

        [Display(Name = "Hard linked to application", Description = "If true, indicates that the application logic references the value or name of this item and should therefore not be changed.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        [Required]
        //[Lazy(Laziness = HbmLaziness.False)]
        public virtual ReferenceList ReferenceList { get; set; }

        //[Lazy(Laziness = HbmLaziness.False)]
        public virtual ReferenceListItem Parent { get; set; }

        /// <summary>
        /// Color associated with the item
        /// </summary>
        [StringLength(50)]
        public virtual string Color { get; set; }

        /// <summary>
        /// Icon associated with the item
        /// </summary>
        [StringLength(50)]
        public virtual string Icon { get; set; }

        /// <summary>
        /// Short alias
        /// </summary>
        [StringLength(50)]
        public virtual string ShortAlias { get; set; }

        /*
        public override ICollection<ValidationResult> ValidationResults()
        {
            var results = base.ValidationResults();

            if (ReferenceList != null && ReferenceList.Items.Any(i => i.ItemValue == this.ItemValue && i.Id != this.Id))
                results.Add(new ValidationResult("Item with the same value already exists", new List<string> { "ItemValue" }));

            return results;
        }
        */

        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }

        public virtual int? TenantId { get; set; }
    }
}
