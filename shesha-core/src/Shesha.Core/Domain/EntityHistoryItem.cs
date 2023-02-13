using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.Text;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Abp.Reflection;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NHibernate.Util;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using Shesha.Reflection;

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