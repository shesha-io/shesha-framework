using Abp.EntityHistory;
using Abp.Extensions;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.EntityHistory
{
    public class EntityHistoryEventCreatorBase<E, T> : IEntityHistoryEventCreator
    {

        /* Single property event features */

        public virtual EntityHistoryEventInfo CreateEvent(EntityChangesInfo change)
        {
            var changeSet = new EntityChangesInfo<E, T>()
            {
                DateTime = change.DateTime,
                Property = change.Property,
            };

            if (change.Entity != null)
                changeSet.Entity = (E)change.Entity;
            if (change.NewValue != null)
                changeSet.NewValue = (T)change.NewValue;
            if (change.OldValue != null)
                changeSet.OldValue = (T)change.OldValue;

            return CreateEvent(changeSet);
        }

        public virtual EntityHistoryEventInfo CreateEvent(EntityChangesInfo<E, T> change)
        {
            var propName = ReflectionHelper.GetDisplayName(change.Property).TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);
            return CreateEvent($"'{propName}' updated", $"'{propName}' updated from {change.OldValue} to {change.NewValue}");
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

        /* Many to many parent event features */

        public virtual EntityHistoryEventInfo? CreateManyToManyEvent(EntityChangesInfo change)
        {
            var changeSet = new EntityChangesInfo<E, IEnumerable<T>>()
            {
                DateTime = change.DateTime,
                Property = change.Property,
            };

            if (change.Entity != null)
                changeSet.Entity = (E)change.Entity;
            if (change.NewValue != null)
                changeSet.NewValue = (IEnumerable<T>)change.NewValue;
            if (change.OldValue != null)
                changeSet.OldValue = (IEnumerable<T>)((IEnumerable<object>)change.OldValue).Select(x => (T)x);

            return CreateManyToManyEvent(changeSet);
        }

        public virtual EntityHistoryEventInfo? CreateManyToManyEvent(EntityChangesInfo<E, IEnumerable<T>> change)
        {
            var (added, removed) = GetListNewAndRemoved(change);

            if (!added.Any() && !removed.Any())
                return null; // skip audit saving

            var propName = ReflectionHelper.GetDisplayName(change.Property).TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);
            var displayProperty = typeof(T).GetDisplayNamePropertyInfoOrNull();

            var description = $"'{propName}' updated. ";
            if (added.Any())
            {
                description += "Added: ";
                description += String.Join(", ", added.Select(x => displayProperty?.GetValue(x)?.ToString() ?? x?.ToString())) + ". ";
            }

            if (removed.Any())
            {
                description += "Removed: ";
                description += String.Join(", ", removed.Select(x => displayProperty?.GetValue(x)?.ToString() ?? x?.ToString())) + ". ";
            }

            return CreateEvent($"'{propName}' updated", description);
        }

        public virtual (IEnumerable<T> addedValues, IEnumerable<T> removedValues) GetListNewAndRemoved(EntityChangesInfo<E, IEnumerable<T>> change)
        {
            return IEnumerableExtensions.GetListNewAndRemoved<T>(change.OldValue, change.NewValue);
        }

        public virtual (IEnumerable<object> addedValues, IEnumerable<object> removedValues) GetListNewAndRemoved(EntityChangesInfo change)
        {
            return IEnumerableExtensions.GetListNewAndRemoved<object>(change.OldValue, change.NewValue);
        }

        /* Many to many child event features */

        public virtual EntityHistoryEventInfo? CreateManyToManyRelationEvent(EntityChangesInfo change)
        {
            var changeSet = new EntityChangeRelationInfo<E, T>()
            {
                DateTime = change.DateTime,
                Property = change.Property,
            };

            if (change.Entity != null)
                changeSet.ParentEntity = (E)change.Entity;
            if (change.NewValue != null) {
                changeSet.ChildEntity = (T) change.NewValue;
                return CreateManyToManyAddRelationEvent(changeSet);
            }
            if (change.OldValue != null)
            {
                changeSet.ChildEntity = (T)change.OldValue;
                return CreateManyToManyRemoveRelationEvent(changeSet);
            }
            return null;
        }

        public virtual EntityHistoryEventInfo CreateManyToManyAddRelationEvent(EntityChangeRelationInfo<E, T> change)
        {
            var propName = ReflectionHelper.GetDisplayName(change.Property).TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);
            var childDisplayProperty = typeof(T).GetDisplayNamePropertyInfoOrNull();
            var childName = childDisplayProperty?.GetValue(change.ChildEntity, null) ?? change.ChildEntity?.ToString();
            var parentDisplayProperty = typeof(E).GetDisplayNamePropertyInfoOrNull();
            var parentName = parentDisplayProperty?.GetValue(change.ParentEntity, null) ?? change.ParentEntity?.ToString();

            return CreateEvent($"Added to a list...", $"'{childName}' added to '{propName}' of '{parentName}'");
        }

        public virtual EntityHistoryEventInfo CreateManyToManyRemoveRelationEvent(EntityChangeRelationInfo<E, T> change)
        {
            var propName = ReflectionHelper.GetDisplayName(change.Property).TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);
            var childDisplayProperty = typeof(T).GetDisplayNamePropertyInfoOrNull();
            var childName = childDisplayProperty?.GetValue(change.ChildEntity, null) ?? change.ChildEntity?.ToString();
            var parentDisplayProperty = typeof(E).GetDisplayNamePropertyInfoOrNull();
            var parentName = parentDisplayProperty?.GetValue(change.ParentEntity, null) ?? change.ParentEntity?.ToString();

            return CreateEvent($"Removed from a list...", $"'{childName}' removed from '{propName}' of '{parentName}'");
        }
    }
}