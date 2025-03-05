using Abp.Domain.Entities;
using Abp.EntityHistory;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    public class EntityHistoryEvent : Entity<Guid>
    {
        public virtual EntityChangeSet EntityChangeSet { get; set; }

        public virtual EntityChange? EntityChange { get; set; }

        public virtual EntityPropertyChange? EntityPropertyChange { get; set; }

        public virtual string? EventType { get; set; }

        public virtual string? EventName { get; set; }

        public virtual string? Description { get; set; }

        [NotMapped]
        public virtual string? PropertyName { get; set; }
    }
}