using System;
using System.Linq.Expressions;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Abp.Extensions;
using Abp.Json;
using Abp.Runtime.Session;
using Abp.Timing;
using NHibernate;
using Shesha.Domain;
using Shesha.EntityHistory;
using Shesha.Exceptions;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using Shesha.Services;

namespace Shesha.NHibernate.EntityHistory
{
    public static class EntityHistoryExtension
    {
        /// <summary>
        /// Add property change description (replace default description)
        /// </summary>
        /// <param name="entity">Changed entity</param>
        /// <param name="description">Description of changes</param>
        /// <param name="property">Changed property</param>
        public static void AddPropertyChangeDescription<TModel, TValue>(this TModel entity, string description, Expression<Func<TModel, TValue>> property)
        {
            try
            {
                string propertyName = ReflectionHelper.GetPropertyName(property);
                AddPropertyChangeDescription(entity, description, propertyName);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        /// Add property change comment (will be added after default description)
        /// </summary>
        /// <param name="entity">Changed entity</param>
        /// <param name="description">Comment of changes</param>
        /// <param name="property">Changed property</param>
        public static void AddPropertyChangeComment<TModel, TValue>(this TModel entity, string description, Expression<Func<TModel, TValue>> property)
        {
            try
            {
                string propertyName = ReflectionHelper.GetPropertyName(property);
                AddPropertyChangeComment(entity, description, propertyName);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        /// Add property change comment (will be added after default description)
        /// </summary>
        /// <param name="entity">Changed entity</param>
        /// <param name="description">Comment of changes</param>
        /// <param name="propertyName">Changed property</param>
        public static void AddPropertyChangeComment(this object entity, string description, string propertyName)
        {
            try
            {
                AddHistoryEvent(entity, EntityHistoryCommonEventTypes.PROPERTY_CHANGE_COMMENT, null, description, propertyName);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        /// Add property change description (replace default description)
        /// </summary>
        /// <param name="entity">Changed entity</param>
        /// <param name="description">Description of changes</param>
        /// <param name="propertyName">Name of changed property</param>
        public static void AddPropertyChangeDescription(this object entity, string description, string propertyName)
        {
            try
            {
                AddHistoryEvent(entity, null, EntityHistoryCommonEventTypes.PROPERTY_CHANGE_USER_TEXT, description, propertyName);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        ///  Add entity event
        /// </summary>
        /// <param name="entity">The entity with which the event occurred</param>
        /// <param name="description">Event description</param>
        public static void AddHistoryEvent(this object entity, string description)
        {
            try
            {
                AddHistoryEvent(entity, EntityHistoryCommonEventTypes.ENTITY_EVENT, "", description, null);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        ///  Add custom entity event
        /// </summary>
        /// <param name="entity">The entity with which the event occurred</param>
        /// <param name="eventType">Event type</param>
        /// <param name="eventName">Event name</param>
        /// <param name="description">Event description</param>
        public static void AddHistoryEvent(this object entity, string eventName, string description)
        {
            try
            {
                AddHistoryEvent(entity, EntityHistoryCommonEventTypes.ENTITY_EVENT, eventName, description, null);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        /// <summary>
        ///  Add custom entity event
        /// </summary>
        /// <param name="entity">The entity with which the event occurred</param>
        /// <param name="eventType">Event type</param>
        /// <param name="eventName">Event name</param>
        /// <param name="description">Event description</param>
        public static void AddHistoryEvent(this object entity, string eventType, string eventName, string description)
        {
            try
            {
                AddHistoryEvent(entity, eventType, eventName, description, null);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }

        public static void AddHistoryEvent(this object entity, string eventType, string eventName, string description, string propertyName)
        {
            try
            {
                var uow = StaticContext.IocManager.Resolve<IUnitOfWorkManager>().Current;
                var entityHistoryHelper = (uow as NhUnitOfWork)?.EntityHistoryHelper;
                var session = StaticContext.IocManager.Resolve<ISessionFactory>().GetCurrentSession();

                var abpSession = StaticContext.IocManager.Resolve<IAbpSession>();

                var id = "";

                var entry = session.GetEntry(entity);
                id = entry != null
                    ? entry.Id.ToString()
                    : entity.ToString();

                var change = new EntityChange
                {
                    ChangeType = EntityChangeType.Updated,
                    ChangeTime = Clock.Now,
                    EntityEntry = entity, // [NotMapped]
                    EntityId = id,
                    EntityTypeFullName = entity.GetType().FullName,
                    TenantId = abpSession.TenantId,
                };

                var historyEvent = new EntityHistoryEvent()
                {
                    Description = description?.ToJsonString().TruncateWithPostfix(EntityPropertyChange.MaxValueLength),
                    PropertyName = propertyName?.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength),
                    EventName = eventName,
                    EventType = eventType,
                    EntityChange = change
                };


                (entityHistoryHelper as EntityHistoryHelper)?.EntityChanges.Add(change);
                (entityHistoryHelper as EntityHistoryHelper)?.EntityHistoryEvents.Add(historyEvent);
            }
            catch (Exception e)
            {
                e.LogError();
            }
        }
    }

}