using Abp;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using Abp.Events.Bus.Entities;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.Timing;
using Castle.Core.Logging;
using NHibernate;
using NHibernate.Collection;
using NHibernate.SqlCommand;
using NHibernate.Transaction;
using NHibernate.Type;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.NHibernate.Interceptors
{
    public class SheshaNHibernateInterceptor : EmptyInterceptor
    {
        public IEntityChangeEventHelper EntityChangeEventHelper { get; set; }

        private readonly IIocManager _iocManager;
        private readonly Lazy<IAbpSession> _abpSession;
        private readonly Lazy<IGuidGenerator> _guidGenerator;
        private readonly Lazy<IEventBus> _eventBus;
        public ILogger Logger { get; set; } = new NullLogger();

        public EntityHistory.IEntityHistoryHelper? EntityHistoryHelper => (_iocManager.Resolve<IUnitOfWorkManager>().Current as NhUnitOfWork)?.EntityHistoryHelper as EntityHistory.IEntityHistoryHelper;
        public ISession? Session => (_iocManager.Resolve<IUnitOfWorkManager>().Current as NhUnitOfWork)?.GetSessionOrNull(true);

        public SheshaNHibernateInterceptor(IIocManager iocManager)
        {
            EntityChangeEventHelper = default!;
            _iocManager = iocManager;

            _abpSession =
                new Lazy<IAbpSession>(
                    () => _iocManager.IsRegistered(typeof(IAbpSession))
                        ? _iocManager.Resolve<IAbpSession>()
                        : NullAbpSession.Instance,
                    isThreadSafe: true
                    );
            _guidGenerator =
                new Lazy<IGuidGenerator>(
                    () => _iocManager.IsRegistered(typeof(IGuidGenerator))
                        ? _iocManager.Resolve<IGuidGenerator>()
                        : SequentialGuidGenerator.Instance,
                    isThreadSafe: true
                    );

            _eventBus =
                new Lazy<IEventBus>(
                    () => _iocManager.IsRegistered(typeof(IEventBus))
                        ? _iocManager.Resolve<IEventBus>()
                        : NullEventBus.Instance,
                    isThreadSafe: true
                );
        }

        public override bool OnSave(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            //Set Id for Guids
            if (entity is IEntity<Guid> guidEntity)
            {
                if (guidEntity.IsTransient())
                {
                    guidEntity.Id = _guidGenerator.Value.Create();
                }
            }

            //Set CreationTime for new entity
            if (entity is IHasCreationTime hasCreationTime)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "CreationTime")
                    {
                        state[i] = hasCreationTime.CreationTime = Clock.Now;
                    }
                }
            }

            //Set CreatorUserId for new entity
            if (entity is ICreationAudited creationAudited && _abpSession.Value.UserId.HasValue)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "CreatorUserId")
                    {
                        state[i] = creationAudited.CreatorUserId = _abpSession.Value.UserId;
                    }
                }
            }

            EntityChangeEventHelper.TriggerEntityCreatingEvent(entity);
            EntityChangeEventHelper.TriggerEntityCreatedEventOnUowCompleted(entity);

            TriggerDomainEvents(entity);
            EntityHistoryHelper?.AddEntityChange(entity);

            return base.OnSave(entity, id, state, propertyNames, types);
        }

        public override bool OnFlushDirty(object entity, object id, object[] currentState, object[] previousState, string[] propertyNames, IType[] types)
        {
            var updated = false;

            //Set modification audits
            if (entity is IHasModificationTime hasModificationTime)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "LastModificationTime")
                    {
                        currentState[i] = hasModificationTime.LastModificationTime = Clock.Now;
                        updated = true;
                    }
                }
            }

            if (entity is IModificationAudited modificationAudited && _abpSession.Value.UserId.HasValue)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "LastModifierUserId")
                    {
                        currentState[i] = modificationAudited.LastModifierUserId = _abpSession.Value.UserId;
                        updated = true;
                    }
                }
            }

            if (entity is ISoftDelete && entity.As<ISoftDelete>().IsDeleted)
            {
                //Is deleted before? Normally, a deleted entity should not be updated later but I preferred to check it.
                var previousIsDeleted = false;
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "IsDeleted")
                    {
                        previousIsDeleted = (bool)previousState[i];
                        break;
                    }
                }

                if (!previousIsDeleted)
                {
                    //set DeletionTime
                    if (entity is IHasDeletionTime hasDeletionTime)
                    {
                        for (var i = 0; i < propertyNames.Length; i++)
                        {
                            if (propertyNames[i] == "DeletionTime")
                            {
                                currentState[i] = hasDeletionTime.DeletionTime = Clock.Now;
                                updated = true;
                            }
                        }
                    }

                    //set DeleterUserId
                    if (entity is IDeletionAudited deletionAudited && _abpSession.Value.UserId.HasValue)
                    {
                        for (var i = 0; i < propertyNames.Length; i++)
                        {
                            if (propertyNames[i] == "DeleterUserId")
                            {
                                currentState[i] = deletionAudited.DeleterUserId = _abpSession.Value.UserId;
                                updated = true;
                            }
                        }
                    }

                    EntityChangeEventHelper.TriggerEntityDeletingEvent(entity);
                    EntityChangeEventHelper.TriggerEntityDeletedEventOnUowCompleted(entity);
                }
                else
                {
                    EntityChangeEventHelper.TriggerEntityUpdatingEvent(entity);
                    EntityChangeEventHelper.TriggerEntityUpdatedEventOnUowCompleted(entity);
                }
            }
            else
            {
                EntityChangeEventHelper.TriggerEntityUpdatingEvent(entity);
                EntityChangeEventHelper.TriggerEntityUpdatedEventOnUowCompleted(entity);
            }

            TriggerDomainEvents(entity);

            EntityHistoryHelper?.AddEntityChange(entity);

            return base.OnFlushDirty(entity, id, currentState, previousState, propertyNames, types) || updated;
        }

        public override void OnDelete(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            EntityChangeEventHelper.TriggerEntityDeletingEvent(entity);
            EntityChangeEventHelper.TriggerEntityDeletedEventOnUowCompleted(entity);

            TriggerDomainEvents(entity);

            EntityHistoryHelper?.AddEntityChange(entity);

            base.OnDelete(entity, id, state, propertyNames, types);
        }

        public override void OnCollectionRecreate(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    // find exact property by loop because map.Role is empty here
                    PropertyInfo? property = null;
                    var props = map.Owner.GetType().GetProperties();
                    foreach (var prop in props)
                    {
                        if (prop.GetValue(map.Owner) == collection)
                        {
                            property = prop;
                            break;
                        }
                    }
                    if (property != null)
                    {
                        EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, null, collection);
                    }
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }
            base.OnCollectionRecreate(collection, key);
        }

        public override void OnCollectionRemove(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    var propertyName = map.Role.Split('.').Last();
                    var property = map.Owner.GetType().GetRequiredProperty(propertyName);
                    var newValue = property.GetValue(map.Owner, null);
                    EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, collection, newValue);
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }
            base.OnCollectionRemove(collection, key);
        }

        public override SqlString OnPrepareStatement(SqlString sql)
        {
            return base.OnPrepareStatement(sql);
        }

        public override void OnCollectionUpdate(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    var propertyName = map.Role.Split('.').Last();
                    var property = map.Owner.GetType().GetRequiredProperty(propertyName);
                    var newValue = property.GetValue(map.Owner, null);
                    EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, map.StoredSnapshot, newValue);
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }

            base.OnCollectionUpdate(collection, key);
        }

        public override void PostFlush(System.Collections.ICollection entities)
        {
            try
            {
                if (EntityHistoryHelper == null)
                    return;

                if (EntityHistoryHelper.EntityChanges.Any())
                {
                    EntityHistoryHelper.SaveAndClear();
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }

            base.PostFlush(entities);
        }

        protected virtual void TriggerDomainEvents(object entityAsObj)
        {
            var generatesDomainEventsEntity = entityAsObj as IGeneratesDomainEvents;
            if (generatesDomainEventsEntity == null)
            {
                return;
            }

            if (generatesDomainEventsEntity.DomainEvents.IsNullOrEmpty())
            {
                return;
            }

            var domainEvents = generatesDomainEventsEntity.DomainEvents.ToList();
            generatesDomainEventsEntity.DomainEvents.Clear();

            foreach (var domainEvent in domainEvents)
            {
                _eventBus.Value.Trigger(domainEvent.GetType(), entityAsObj, domainEvent);
            }
        }

        public override bool OnLoad(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            if (entity.GetType().IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
            {
                return true;
            }

            NormalizeDateTimePropertiesForEntity(entity, state, propertyNames, types);
            return true;
        }

        private static void NormalizeDateTimePropertiesForEntity(object entity, object[] state, string[] propertyNames, IList<IType> types)
        {
            for (var i = 0; i < types.Count; i++)
            {
                //var prop = entity.GetType().GetProperty(propertyNames[i]);
                var prop = entity.GetType().GetClosestPropertyOrNull(propertyNames[i]);
                if (prop != null && prop.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                {
                    continue;
                }

                if (types[i].IsComponentType)
                {
                    NormalizeDateTimePropertiesForComponentType(state[i], types[i]);
                }

                if (types[i].ReturnedClass != typeof(DateTime) && types[i].ReturnedClass != typeof(DateTime?))
                {
                    continue;
                }

                var dateTime = state[i] as DateTime?;

                if (!dateTime.HasValue)
                {
                    continue;
                }

                state[i] = Clock.Normalize(dateTime.Value);
            }
        }

        private static void NormalizeDateTimePropertiesForComponentType(object? componentObject, IType type)
        {
            if (componentObject == null)
                return;

            var componentType = type as ComponentType;
            if (componentType == null)
                return;

            for (int i = 0; i < componentType.PropertyNames.Length; i++)
            {
                var propertyName = componentType.PropertyNames[i];
                if (componentType.Subtypes[i].IsComponentType)
                {
                    var prop = componentObject.GetType().GetProperty(propertyName);
                    if (prop == null)
                    {
                        continue;
                    }

                    if (prop.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                    {
                        continue;
                    }

                    var value = prop.GetValue(componentObject, null);
                    NormalizeDateTimePropertiesForComponentType(value, componentType.Subtypes[i]);
                }

                if (componentType.Subtypes[i].ReturnedClass != typeof(DateTime) && componentType.Subtypes[i].ReturnedClass != typeof(DateTime?))
                {
                    continue;
                }

                var subProp = componentObject.GetType().GetProperty(propertyName);
                if (subProp == null)
                {
                    continue;
                }

                if (subProp.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                {
                    continue;
                }

                var dateTime = subProp.GetValue(componentObject) as DateTime?;

                if (!dateTime.HasValue)
                {
                    continue;
                }

                subProp.SetValue(componentObject, Clock.Normalize(dateTime.Value));
            }
        }

        #region post transaction actions

        /// <summary>
        /// Add action that should be executed after completion of the current transaction
        /// </summary>
        /// <param name="action"></param>
        public void AddAfterTransactionAction(Action action)
        {
            Session.NotNull("No active session");

            #pragma warning disable IDISP001 // Dispose created
            var transaction = Session.GetCurrentTransaction();
            #pragma warning restore IDISP001 // Dispose created

            if (transaction == null || !transaction.IsActive)
                throw new InvalidOperationException("No active transaction");

            transaction.RegisterSynchronization(new TransactionCompletionSynchronization(action));
        }

        private class TransactionCompletionSynchronization : ITransactionCompletionSynchronization
        {
            private readonly Action _action;

            public TransactionCompletionSynchronization(Action action)
            {
                _action = action;
            }

            public void ExecuteAfterTransactionCompletion(bool success)
            {
                if (success)
                    _action();
            }

            public Task ExecuteAfterTransactionCompletionAsync(bool success, CancellationToken cancellationToken)
            {
                if (success)
                    _action();
                return Task.CompletedTask;
            }

            public void ExecuteBeforeTransactionCompletion()
            {
            }

            public Task ExecuteBeforeTransactionCompletionAsync(CancellationToken cancellationToken)
            {
                return Task.CompletedTask;
            }
        }

        #endregion
    }
}
