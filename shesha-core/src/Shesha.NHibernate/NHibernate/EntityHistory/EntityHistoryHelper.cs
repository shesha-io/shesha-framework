using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Abp.Extensions;
using Abp.Json;
using Abp.Reflection;
using Abp.Timing;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Intercept;
using NHibernate.Proxy;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using SessionExtensions = Shesha.NHibernate.Session.SessionExtensions;

namespace Shesha.NHibernate.EntityHistory
{
    /// <summary>
    /// Entity history helper. Creates and stores changes of entities
    /// </summary>
    public class EntityHistoryHelper : EntityHistoryHelperBase, IEntityHistoryHelper, ITransientDependency
    {
        private ITypeFinder _typeFinder;

        [DebuggerStepThrough]
        public EntityHistoryHelper(
            ITypeFinder typeFinder,
            IEntityHistoryConfiguration configuration,
            IUnitOfWorkManager unitOfWorkManager)
            : base(configuration, unitOfWorkManager)
        {
            EntityChanges = new List<EntityChange>();
            EntityHistoryEvents = new List<EntityHistoryEvent>();
            Id = Guid.NewGuid();

            _typeFinder = typeFinder;
        }

        public Guid Id { get; set; }

        public EntityChangeSet EntityChangeSet { get; set; }
        public List<EntityChange> EntityChanges { get; set; }
        public List<EntityHistoryEvent> EntityHistoryEvents { get; set; }
        public ISession Session => (UnitOfWorkManager.Current as NhUnitOfWork)?.GetSession();

        public virtual void AddEntityChange(object entity)
        {
            try
            {
                var change = CreateEntityChange(entity);
                if (change != null)
                {
                    EntityChanges.Add(change);
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public virtual EntityChange CreateEntityChange(object entity)
        {
            if (!IsEntityHistoryEnabled) return null;
            if (IsChangesEntity(entity)) return null;

            var typeOfEntity = entity.GetType();
            if (typeOfEntity.HasInterface(typeof(INHibernateProxy)) ||
                typeOfEntity.HasInterface(typeof(IFieldInterceptorAccessor)))
            {
                if (typeOfEntity.BaseType == null) throw new Exception($"Base type of proxy `{typeOfEntity.Name}`, object `{entity}`");
                // unproxy
                typeOfEntity = typeOfEntity.BaseType;
            }

            if (!IsTypeOfEntity(typeOfEntity))
            {
                return null;
            }

            var isTracked = IsTypeOfTrackedEntity(typeOfEntity);
            if (isTracked != null && !isTracked.Value) return null;

            var isAudited = IsTypeOfAuditedEntity(typeOfEntity);
            if (isAudited != null && !isAudited.Value) return null;

            if (isAudited == null && isTracked == null)
            {
                if (!typeOfEntity.GetProperties()
                    .Any(p =>
                        (IsAuditedPropertyInfo(p) ?? false)
                        || (IsAditedBooleanPropertyInfo(p) ?? false)
                        || (IsAditedAsEventPropertyInfo(p) ?? false)))
                {
                    return null;
                }
            }

            var entityTypeFullName = typeOfEntity.FullName;
            EntityEntry entityEntry;

            if ((entityEntry = Session?.GetEntry(entity, false)) == null) return null;
            var id = entityEntry.Id;

            EntityChangeType changeType;
            if (Session.IsEntityDeleted(entity)) changeType = EntityChangeType.Deleted;
            else if (entityEntry.LoadedState == null) changeType = EntityChangeType.Created;
            else changeType = EntityChangeType.Updated;

            var className = NHibernateProxyHelper.GuessClass(entity).FullName;
            var sessionImpl = Session.GetSessionImplementation();
            var persister = sessionImpl.Factory.GetEntityPersister(className);

            Object[] currentState = persister.GetPropertyValues(entity);
            Int32[] dirtyP = changeType != EntityChangeType.Created && entityEntry.LoadedState != null
                ? persister.FindDirty(currentState, entityEntry.LoadedState, entity, sessionImpl) // changed properties
                : Enumerable.Range(0, currentState.Length - 1).ToArray(); // all properties for new entity

            var ioc = StaticContext.IocManager;
            var creatorTypes = _typeFinder.Find(t => typeof(IEntityHistoryCreator).IsAssignableFrom(t) && t.IsClass).ToList();

            foreach (var creatorType in creatorTypes)
            {
                if (ioc.Resolve(creatorType) is IEntityHistoryCreator creator && creator.TypeAllowed(entity.GetType()))
                {
                    return creator.GetEntityChange(entity, AbpSession, persister.PropertyNames, entityEntry.LoadedState, currentState, dirtyP);
                }
            }

            var dirtyProps = dirtyP.Select(i => new SessionExtensions.DirtyPropertyInfo
                    { Name = persister.PropertyNames[i], OldValue = entityEntry.LoadedState?[i], NewValue = currentState[i] })
                .ToList();

            var entityChange = new EntityChange
            {
                ChangeType = changeType,
                ChangeTime = Clock.Now,
                EntityEntry = entity, // [NotMapped]
                EntityId = id?.ToString(),
                EntityTypeFullName = entityTypeFullName,
                TenantId = AbpSession.TenantId,
            };

            var propertyChanges = new List<EntityPropertyChange>();
            if (changeType != EntityChangeType.Created)
            {
                propertyChanges.AddRange(GetPropertyChanges((isAudited ?? false) || (isTracked ?? false), entityChange,
                    typeOfEntity, entity, dirtyProps));
                if (propertyChanges.Count == 0 && //changeType != EntityChangeType.Created &&
                    EntityHistoryEvents.All(x => x.EntityChange != entityChange))
                {
                    return null;
                }
            }
            entityChange.PropertyChanges = propertyChanges;

            return entityChange;
        }

        protected override bool? IsAuditedPropertyInfo(PropertyInfo propertyInfo)
        {
            // do not save properties of audition
            return
                propertyInfo.Name == nameof(FullAuditedEntity.CreatorUserId)
                || propertyInfo.Name == nameof(AuditedEntity<Guid, IEntity<long>>.CreatorUser)
                || propertyInfo.Name == nameof(FullAuditedEntity.CreationTime)
                || propertyInfo.Name == nameof(FullAuditedEntity.DeleterUserId)
                || propertyInfo.Name == nameof(FullAuditedEntity<Guid, IEntity<long>>.DeleterUser)
                || propertyInfo.Name == nameof(FullAuditedEntity.DeletionTime)
                || propertyInfo.Name == nameof(FullAuditedEntity.LastModifierUserId)
                || propertyInfo.Name == nameof(AuditedEntity<Guid, IEntity<long>>.LastModifierUser)
                || propertyInfo.Name == nameof(FullAuditedEntity.LastModificationTime)
                ? false
                : base.IsAuditedPropertyInfo(propertyInfo);
        }

        /// <summary>
        /// Gets the property changes for this entry.
        /// </summary>
        private ICollection<EntityPropertyChange> GetPropertyChanges(bool fullAudited, EntityChange entityChange, Type unproxiedEntityType, object entity,
            IList<SessionExtensions.DirtyPropertyInfo> dirtyProps)
        {
            var propertyChanges = new List<EntityPropertyChange>();

            var entityProps = unproxiedEntityType.GetProperties().ToList();

            foreach (var property in dirtyProps)
            {
                var propInfo = entityProps.FirstOrDefault(x => x.Name == property.Name);
                if (propInfo == null)
                {
                    Logger.Debug($"Changed property {property.Name} not found");
                    continue;
                }

                var isAuditedProp = IsAuditedPropertyInfo(propInfo);
                var shouldSaveProperty =
                    fullAudited && (isAuditedProp == null || isAuditedProp.Value)
                    || (isAuditedProp != null && isAuditedProp.Value)
                    || (IsAditedBooleanPropertyInfo(propInfo) ?? false)
                    || (IsAditedAsEventPropertyInfo(propInfo) ?? false)
                    ;

                if (shouldSaveProperty)
                {
                    var propType = propInfo.PropertyType;

                    var propName = ReflectionHelper.GetDisplayName(propInfo).TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);

                    if (propType.GetInterfaces().Contains(typeof(IEntity))
                        || propType.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEntity<>)))
                    {
                        EntityPropertyChange propchange = null;
                        // skip creating property changes
                        if (propInfo.GetCustomAttribute<AuditedAsEventAttribute>()?.SaveFullInfo ?? true)
                        {
                            propchange = CreateEntityPropertyChange(
                                property.OldValue != null
                                    ? propType.GetProperty("Id")?.GetValue(property.OldValue).ToString() ??
                                      property.OldValue.ToString()
                                    : "",
                                property.NewValue != null
                                    ? propType.GetProperty("Id")?.GetValue(property.NewValue).ToString() ??
                                      property.NewValue.ToString()
                                    : "",
                                propInfo
                            );
                            propertyChanges.Add(propchange);
                        }

                        if (!AddAuditedAsEvent(propInfo, property, propchange, entityChange, entity))
                        {
                            var displayProperty = propType.GetProperties()
                                .FirstOrDefault(x => x.HasAttribute<EntityDisplayNameAttribute>());

                            var description = $"`{propName}` was changed from `" +
                                              (property.OldValue != null
                                                  ? displayProperty?.GetValue(property.OldValue)?.ToString() ??
                                                    property.OldValue.ToString()
                                                  : "") +
                                              "` to `" +
                                              (property.NewValue != null
                                                  ? displayProperty?.GetValue(property.NewValue)?.ToString() ??
                                                    property.NewValue.ToString()
                                                  : "") + '`';
                            // Add extended (friendly) description for Reference types
                            EntityHistoryEvents.Add(new EntityHistoryEvent()
                            {
                                Description = description,
                                PropertyName =
                                    propInfo.Name.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength),
                                EventName = "",
                                EventType = EntityHistoryCommonEventTypes.PROPERTY_CHANGE_FRIENDLY_TEXT,
                                EntityPropertyChange = propchange
                            });
                        }
                    }
                    else
                    {

                        var oldValue = property.OldValue;
                        var newValue = property.NewValue;

                        EntityPropertyChange propchange = null;
                        // skip creating property changes
                        if (propInfo.GetCustomAttribute<AuditedAsEventAttribute>()?.SaveFullInfo ?? true)
                        {
                            // Get Reference List item values
                            var refListProperty = propInfo.GetReferenceListIdentifierOrNull();
                            if (refListProperty != null)
                            {
                                oldValue = property.OldValue != null
                                    ? StaticContext.IocManager.Resolve<IReferenceListHelper>()
                                        .GetItemDisplayText(new ReferenceListIdentifier(refListProperty.Module, refListProperty.Name),
                                            property.OldValue.GetType().IsEnum
                                                ? (long?)Convert.ChangeType(property.OldValue, Enum.GetUnderlyingType(property.OldValue.GetType()))
                                                : (long?)property.OldValue)
                                    : null;
                                newValue = property.NewValue != null
                                    ? StaticContext.IocManager.Resolve<IReferenceListHelper>()
                                        .GetItemDisplayText(new ReferenceListIdentifier(refListProperty.Module, refListProperty.Name),
                                            property.NewValue.GetType().IsEnum
                                                ? (long?)Convert.ChangeType(property.NewValue, Enum.GetUnderlyingType(property.NewValue.GetType()))
                                                : (long?)property.NewValue)
                                    : null;
                            }

                            propchange = CreateEntityPropertyChange(
                                oldValue,
                                newValue,
                                propInfo
                            );
                            propertyChanges.Add(propchange);
                        }


                        if (!AddAuditedAsEvent(propInfo, property, propchange, entityChange, entity))
                        {
                            var attr = propInfo.GetCustomAttribute<AuditedBooleanAttribute>();
                            if (attr != null)
                            {
                                var description = (bool)newValue ? attr.TrueText : attr.FalseText;
                                // Add extended (friendly) description for Reference types
                                EntityHistoryEvents.Add(new EntityHistoryEvent()
                                {
                                    Description = description,
                                    PropertyName =
                                        propInfo.Name.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength),
                                    EventName = attr.EventText,
                                    EventType = EntityHistoryCommonEventTypes.PROPERTY_CHANGE_FRIENDLY_TEXT,
                                    EntityPropertyChange = propchange
                                });
                            }
                        }
                    }
                }
            }

            return propertyChanges;
        }

        private bool AddAuditedAsEvent(PropertyInfo propInfo, SessionExtensions.DirtyPropertyInfo property, EntityPropertyChange propertyChange, EntityChange entityChange, object entity)
        {
            var auditedAsEvent = propInfo.GetCustomAttribute<AuditedAsEventAttribute>();
            if (auditedAsEvent != null)
            {
                // Try to start Event creator from the property attribute
                if (Activator.CreateInstance(auditedAsEvent.EventCreator) is IEntityHistoryEventCreator instance)
                {
                    var enentInfo = instance.CreateEvent(new EntityChangesInfo()
                    {
                        Entity = entity,
                        DateTime = DateTime.Now,
                        OldValue = property.OldValue,
                        NewValue = property.NewValue
                    });

                    EntityHistoryEvents.Add(new EntityHistoryEvent()
                    {
                        Description = enentInfo.Description,
                        PropertyName =
                            propInfo.Name.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength),
                        EventName = enentInfo.EventName,
                        EventType = string.IsNullOrEmpty(enentInfo.EventType) ? EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT : enentInfo.EventType,
                        EntityPropertyChange = propertyChange,
                        EntityChange = entityChange
                    });
                    return true;
                }
            }

            return false;
        }

        private EntityPropertyChange CreateEntityPropertyChange(object oldValue, object newValue, PropertyInfo propertyInfo)
        {
            var proprtyName = propertyInfo.Name.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength);
            var propertyChange = new EntityPropertyChange()
            {
                PropertyName = proprtyName,
                PropertyTypeFullName = propertyInfo.PropertyType.FullName.TruncateWithPostfix(EntityPropertyChange.MaxPropertyTypeFullNameLength),
                TenantId = AbpSession.TenantId
            };
            propertyChange.SetOriginalValue(oldValue?.ToJsonString());
            propertyChange.SetNewValue(newValue?.ToJsonString());

            return propertyChange;
        }

        public virtual EntityChangeSet CreateEntityChangeSet()
        {
            if (!IsEntityHistoryEnabled) return null;

            var changeSet = new EntityChangeSet()
            {
                Reason = EntityChangeSetReasonProvider.Reason.TruncateWithPostfix(EntityChangeSet.MaxReasonLength),

                // Fill "who did this change"
                BrowserInfo = ClientInfoProvider.BrowserInfo.TruncateWithPostfix(EntityChangeSet.MaxBrowserInfoLength),
                ClientIpAddress = ClientInfoProvider.ClientIpAddress.TruncateWithPostfix(EntityChangeSet.MaxClientIpAddressLength),
                ClientName = ClientInfoProvider.ComputerName.TruncateWithPostfix(EntityChangeSet.MaxClientNameLength),
                ImpersonatorTenantId = AbpSession.ImpersonatorTenantId,
                ImpersonatorUserId = AbpSession.ImpersonatorUserId,
                TenantId = AbpSession.TenantId,
                UserId = AbpSession.UserId
            };

            // Add description for property change
            foreach (var entityHistoryEvent in EntityHistoryEvents.Where(x =>
                !string.IsNullOrEmpty(x.PropertyName)
                && x.EntityChange != null
                && x.EventType != EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT))
            {
                var prop = EntityChanges
                    .FirstOrDefault(x =>
                        x.EntityId == entityHistoryEvent.EntityChange.EntityId
                        && x.EntityTypeFullName == entityHistoryEvent.EntityChange.EntityTypeFullName
                        && x.PropertyChanges != null)
                    ?.PropertyChanges.FirstOrDefault(x => x.PropertyName == entityHistoryEvent.PropertyName);

                if (prop != null)
                {
                    entityHistoryEvent.EntityPropertyChange = prop;

                    EntityChanges.Remove(entityHistoryEvent.EntityChange);
                    entityHistoryEvent.EntityChange = null;
                }
            }

            changeSet.EntityChanges = EntityChanges;

            return changeSet;
        }

        public virtual void Save(EntityChangeSet changeSet)
        {
            try
            {
                if (!IsEntityHistoryEnabled) return;

                //UpdateChangeSet(context, changeSet);

                if (changeSet.EntityChanges.Count == 0)
                {
                    return;
                }

                StaticContext.IocManager.Resolve<NHibernateEntityHistoryStore>()?.Save(changeSet);
                //StaticContext.IocManager.Resolve<IEntityHistoryStore>()?.Save(changeSet);
                var historyEventRepository = StaticContext.IocManager.Resolve<IRepository<EntityHistoryEvent, Guid>>();
                EntityHistoryEvents.ForEach(e => historyEventRepository.Insert(e));
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public virtual void SaveAndClear()
        {
            try
            {
                if (!IsEntityHistoryEnabled) return;

                var changeSet = CreateEntityChangeSet();
                if (changeSet == null) return;
                Save(changeSet);
                EntityChanges.Clear();
                EntityHistoryEvents.Clear();
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        private bool IsChangesEntity(object entity)
        {
            var entityType = entity.GetType();
            return
                typeof(EntityChangeSet).IsAssignableFrom(entityType)
                || typeof(EntityChange).IsAssignableFrom(entityType)
                || typeof(EntityPropertyChange).IsAssignableFrom(entityType);
        }

        protected virtual bool? IsAditedBooleanPropertyInfo(PropertyInfo propertyInfo)
        {
            if (propertyInfo.IsDefined(typeof(AuditedBooleanAttribute), true))
            {
                return true;
            }

            return null;
        }

        protected virtual bool? IsAditedAsEventPropertyInfo(PropertyInfo propertyInfo)
        {
            if (propertyInfo.IsDefined(typeof(AuditedAsEventAttribute), true))
            {
                return true;
            }

            return null;
        }

    }
}
