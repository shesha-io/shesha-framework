using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(FriendlyName = "Notification")]
    public class Notification : FullAuditedEntity<Guid>
    {
        [NotMapped, EntityDisplayName]
        public virtual string FullName => !string.IsNullOrEmpty(Namespace) ? Namespace + ": " + Name : !string.IsNullOrEmpty(Name) ? Name : Id.ToString();

        [Required]
        [StringLength(255)]
        public virtual string Name { get; set; }

        [Required]
        [StringLength(255)]
        public virtual string Namespace { get; set; }

        [DataType(DataType.MultilineText)]
        [StringLength(int.MaxValue)]
        public virtual string Description { get; set; }
    }
}
