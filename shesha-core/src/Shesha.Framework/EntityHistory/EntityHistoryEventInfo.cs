using System;
using System.Reflection;

namespace Shesha.EntityHistory
{
    public class EntityHistoryEventInfo
    {
        public string EventType { get; set; }

        public string EventName { get; set; }

        public string Description { get; set; }
    }

    public class EntityChangesInfo
    {
        public virtual object Entity { get; set; }
        public virtual PropertyInfo Property { get; set; }
        public virtual object? OldValue { get; set; }
        public virtual object? NewValue { get; set; }

        public DateTime DateTime { get; set; }
    }

    public class EntityChangesInfo<E, T> : EntityChangesInfo
    {
        public new E Entity { get; set; }
        public new PropertyInfo Property { get; set; }
        public new T OldValue { get; set; }
        public new T NewValue { get; set; }
    }

    public class EntityChangeRelationInfo
    {
        public virtual object ParentEntity { get; set; }
        public virtual PropertyInfo Property { get; set; }
        public virtual object ChildEntity { get; set; }

        public DateTime DateTime { get; set; }
    }

    public class EntityChangeRelationInfo<E, T> : EntityChangeRelationInfo
    {
        public new E ParentEntity { get; set; }
        public new PropertyInfo Property { get; set; }
        public new T ChildEntity { get; set; }
    }

}