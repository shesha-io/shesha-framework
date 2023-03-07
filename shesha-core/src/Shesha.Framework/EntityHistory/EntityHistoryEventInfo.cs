using System;

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
        public virtual object OldValue { get; set; }
        public virtual object NewValue { get; set; }

        public DateTime DateTime { get; set; }
    }

    public class EntityChangesInfo<E, T> : EntityChangesInfo
    {
        public new E Entity { get; set; }
        public new T OldValue { get; set; }
        public new T NewValue { get; set; }
    }
}