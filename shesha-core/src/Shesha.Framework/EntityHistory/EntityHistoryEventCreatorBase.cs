using System;
using Shesha.Exceptions;

namespace Shesha.EntityHistory
{
    public abstract class EntityHistoryEventCreatorBase<E, T> : IEntityHistoryEventCreator
    {
        public virtual EntityHistoryEventInfo CreateEvent(EntityChangesInfo change)
        {
            var changeSet = new EntityChangesInfo<E, T>()
            {
                DateTime = change.DateTime,
            };

            if (change.Entity != null)
                changeSet.Entity = (E)change.Entity;
            if (change.NewValue != null)
                changeSet.NewValue = (T)change.NewValue;
            if (change.OldValue != null)
                changeSet.OldValue = (T)change.OldValue;

            return CreateEvent(changeSet);
        }

        public virtual EntityHistoryEventInfo CreateEvent(string eventName, string description)
        {
            return CreateEvent("", eventName, description);
        }

        public virtual EntityHistoryEventInfo CreateEvent(string eventType, string eventName, string description)
        {
            return new EntityHistoryEventInfo()
            {
                EventType = eventType,
                EventName = eventName,
                Description = description
            };
        }

        public virtual EntityHistoryEventInfo CreateEvent(EntityChangesInfo<E,T> change)
        {
            throw new System.NotImplementedException();
        }

    }
}