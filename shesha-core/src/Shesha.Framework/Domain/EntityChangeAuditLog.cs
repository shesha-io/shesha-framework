﻿using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_Frwk_EntityChangeAuditLogs")]
    [ImMutable]
    public class EntityChangeAuditLog: Entity<long>
    {
        /// <summary>
        /// The Id of the Entity of the property that is audited
        /// </summary>
        public virtual string EntityId { get; protected set; } = default!;
        /// <summary>
        /// The name of the property that is audited
        /// </summary>
        public virtual string PropertyName { get; protected set; } = default!;

        /// <summary>
        /// The value of the property before the change
        /// </summary>
        public virtual string? OriginalValue { get; protected set; } 

        /// <summary>
        /// The value of the property after the change
        /// </summary>
        public virtual string? NewValue { get; protected set; }

        /// <summary>
        /// The name of the Entity of the property that is audited
        /// </summary>
        public virtual string? EntityTypeFullName { get; protected set; }

        /// <summary>
        /// The time in which the audit was created
        /// </summary>
        public virtual string CreationTime { get; protected set; } = default!;

        /// <summary>
        /// The full name of the user that made the change
        /// </summary>
        public virtual string? ActionedBy { get; protected set; }

        /// <summary>
        /// The type of change that was made. Options: Created, Updated, Deleted
        /// </summary>
        public virtual string? ChangeType { get; protected set; }
    }
}
