using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace Shesha.Domain
{
    /// <summary>
    /// Base class for implementation of entities that represents a relationship between two other entities.
    /// Should inherit and implement the properties that refer to the other entities.
    /// </summary>
    public abstract class RelationshipEntityBase<T> : FullAuditedEntity<T>, IMayHaveTenant
    {
        [Column("RoleLkp")]
        public virtual int? Role { get; set; }

        public virtual bool Inactive { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime? ValidFromDate { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime? ValidToDate { get; set; }

        public virtual int? TenantId { get; set; }
    }
}
