using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_Core_EntityHistoryItems")]
    [ImMutable]
    public class EntityHistoryItem : Entity<long>, ITransientDependency
    {
        //EntityCahgeSetId
        public virtual EntityChangeSet EntityChangeSet { get; set; }

        public virtual DateTime? CreationTime { get; set; }

        //EntityChangeId
        public virtual EntityChange EntityChange { get; set; }

        public virtual EntityChangeType? ChangeType { get; set; }

        public virtual string EntityId { get; set; }

        public virtual string EntityTypeFullName { get; set; }

        public virtual string PropertyTypeFullName { get; set; }

        public virtual string PropertyName { get; set; }

        public virtual string OriginalValue { get; set; }
        
        public virtual string NewValue { get; set; }

        public virtual Person Person { get; set; }

        public virtual string UserFullName { get; set; }

        public virtual int? UserId { get; set; }

        public virtual int? TenantId { get; set; }
    }
}