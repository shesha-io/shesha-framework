using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Table("vw_Frwk_EntityChangeAuditLogs")]
    [ImMutable]
    public class EntityChangeAuditLog: Entity<Guid>
    {
        /// <summary>
        /// The name of the property that is audited
        /// </summary>
        public virtual string PropertyName { get; protected set; }        
        
        /// <summary>
        /// The value of the property before the change
        /// </summary>
        public virtual string OriginalValue { get; protected set; } 

        /// <summary>
        /// The value of the property after the change
        /// </summary>
        public virtual string NewValue { get; protected set; }

        /// <summary>
        /// The name of the Entity of the property that is audited
        /// </summary>
        public virtual string EntityTypeFullName { get; protected set; }

        /// <summary>
        /// The time in which the audit was created
        /// </summary>
        public virtual string CreationTime { get; protected set; }

        /// <summary>
        /// The full name of the user that made the change
        /// </summary>
        public virtual string ActionedBy { get; protected set; }

        /// <summary>
        /// The type of change that was made. Options: Created, Updated, Deleted
        /// </summary>
        public virtual string ChangeType { get; protected set; }
    }
}
