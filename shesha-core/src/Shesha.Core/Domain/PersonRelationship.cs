using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Core.PersonRelationship")]
    [Discriminator]
    public class PersonRelationship : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        [Required]
        public virtual Person PersonA { get; set; }

        [Required]
        public virtual Person PersonB { get; set; }

        [Column("AtoBPersonRelationshipTypeLkp")]
        public virtual int? AtoBPersonRelationshipType { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime? ValidFromDate { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime? ValidToDate { get; set; }

        public virtual int? TenantId { get; set; }
    }
}
