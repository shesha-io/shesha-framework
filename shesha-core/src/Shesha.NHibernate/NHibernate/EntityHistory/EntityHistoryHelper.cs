using Abp.Auditing;
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
using Abp.Runtime.Session;
using Abp.Threading;
using Abp.Timing;
using NHibernate;
using NHibernate.Proxy;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityHistory;
using Shesha.Extensions;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UoW;
using Shesha.Orm;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.NHibernate.EntityHistory
{
    /// <summary>
    /// Entity history helper. Creates and stores changes of entities
    /// </summary>
    public class EntityHistoryHelper : EntityHistoryHelperBase, IEntityHistoryHelper
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IReferenceListHelper _refListHelper;
        private readonly NHibernateEntityHistoryStore _historyStore;
        private readonly IRepository<EntityHistoryEvent, Guid> _historyEventRepository;
        private readonly IIocResolver _iocResolver;
        private readonly IModelConfigurationManager _modelConfigurationManager;


        //[DebuggerStepThrough]
        public EntityHistoryHelper(
            ITypeFinder typeFinder,
            IEntityHistoryConfiguration configuration,
            IUnitOfWorkManager unitOfWorkManager,
            IReferenceListHelper refListHelper,
            NHibernateEntityHistoryStore historyStore,
            IRepository<EntityHistoryEvent, Guid> historyEventRepository,
            IModelConfigurationManager modelConfigurationManager,
            IIocResolver iocResolver
            )
            : base(configuration, unitOfWorkManager)
        {
            EntityChanges = new List<EntityChange>();
            EntityHistoryEvents = new List<EntityHistoryEvent>();
            Id = Guid.NewGuid();

            _typeFinder = typeFinder;
            _refListHelper = refListHelper;
            _historyStore = historyStore;
            _historyEventRepository = historyEventRepository;
            _iocResolver = iocResolver;
            _modelConfigurationManager = modelConfigurationManager;
        }

        public Guid Id { get; set; }

        public List<EntityChange> EntityChanges { get; set; }
        public List<EntityHistoryEvent> EntityHistoryEvents { get; set; }
        public ISession? Session => (UnitOfWorkManager.Current as NhUnitOfWork)?.GetSessionOrNull();

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

        public virtual EntityChange? CreateEntityChange(object entity)
        {
            if (!IsEntityHistoryEnabled) return null;
            if (IsChangesEntity(entity)) return null;

            if (Session == null)
                throw new SessionException("Session is not available");

            var typeOfEntity = entity.GetType().StripCastleProxyType();

            if (!IsTypeOfEntity(typeOfEntity))
                return null;

            var isTracked = IsTypeOfTrackedEntity(typeOfEntity);
            if (isTracked != null && !isTracked.Value) return null;

            var isAudited = IsTypeOfAuditedEntity(typeOfEntity);
            if (isAudited != null && !isAudited.Value) return null;

            var entityConfig = AsyncHelper.RunSync(async () => await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(typeOfEntity.Namespace.NotNull(), typeOfEntity.Name));

            if (entityConfig != null && isAudited == null && isTracked == null)
            {
                if (!typeOfEntity.GetProperties()
                    .Any(p =>
                        (entityConfig.Properties.FirstOrDefault(x => x.Name.ToCamelCase() == p.Name.ToCamelCase())?.Audited ?? false)
                        || (IsAuditedPropertyInfo(p) ?? false)
                        || (IsAditedBooleanPropertyInfo(p) ?? false)
                        || (IsAditedAsEventPropertyInfo(p) ?? false)))
                {
                    return null;
                }
            }

            var entityTypeFullName = typeOfEntity.FullName;
            var entityEntry = Session.GetEntryOrNull(entity);
            if (entityEntry == null) 
                return null;

            var id = entityEntry.Id;

            EntityChangeType changeType;
            if (Session.IsEntityDeleted(entity)) changeType = EntityChangeType.Deleted;
            else
                if (entityEntry.LoadedState == null)
                changeType = EntityChangeType.Created;
            else
                changeType = EntityChangeType.Updated;

            var className = NHibernateProxyHelper.GuessClass(entity).FullName;
            var sessionImpl = Session.GetSessionImplementation();
            var persister = sessionImpl.Factory.GetEntityPersister(className);

            Object[] currentState = persister.GetPropertyValues(entity);
            Int32[] dirtyP = changeType != EntityChangeType.Created && entityEntry.LoadedState != null
                ? persister.FindDirty(currentState, entityEntry.LoadedState, entity, sessionImpl) // changed properties
                : Enumerable.Range(0, currentState.Length - 1).ToArray(); // all properties for new entity

            var creatorTypes = _typeFinder.Find(t => typeof(IEntityHistoryCreator).IsAssignableFrom(t) && t.IsClass).ToList();

            foreach (var creatorType in creatorTypes)
            {
                if (_iocResolver.Resolve(creatorType) is IEntityHistoryCreator creator && creator.TypeAllowed(entity.GetType()))
                {
                    return creator.GetEntityChange(entity, AbpSession, persister.PropertyNames, entityEntry.LoadedState ?? [], currentState, dirtyP);
                }
            }

            var dirtyProps = dirtyP.Select(i => new DirtyPropertyInfo
                    { Name = persister.PropertyNames[i], OldValue = entityEntry.LoadedState?[i], NewValue = currentState[i] })
                .ToList();

            var entityChange = EntityChanges.FirstOrDefault(x => x.EntityId == id?.ToString() && x.EntityTypeFullName == entityTypeFullName)
                ?? new EntityChange
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
                entityConfig.NotNull("EntityConfig must not be null");
                propertyChanges.AddRange(GetPropertyChanges((isAudited ?? false) || (isTracked ?? false), entityChange, typeOfEntity, entity, entityConfig, dirtyProps));

                if (propertyChanges.Count == 0 && //changeType != EntityChangeType.Created &&
                    EntityHistoryEvents.All(x => x.EntityChange != entityChange))
                {
                    return null;
                }
            }
            entityChange.PropertyChanges = propertyChanges;

            return entityChange;
        }

        protected bool? IsAuditedProperty(PropertyInfo propertyInfo)
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
            ModelConfigurationDto entityConfig, IList<DirtyPropertyInfo> dirtyProps)
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

                var configuredAudit = (entityConfig.Properties.FirstOrDefault(x => x.Name.ToCamelCase() == propInfo.Name.ToCamelCase())?.Audited ?? false);
                var isAuditedProp = IsAuditedPropertyInfo(propInfo);
                var shouldSaveProperty =
                    fullAudited && (isAuditedProp == null || isAuditedProp.Value)
                    || configuredAudit
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
                        EntityPropertyChange? propchange = null;
                        // skip creating property changes
                        if (propInfo.GetCustomAttribute<AuditedAsEventAttribute>()?.SaveFullInfo ?? true)
                        {
                            propchange = CreateEntityPropertyChange(
                                property.OldValue != null
                                    ? propType.GetProperty("Id")?.GetValue(property.OldValue)?.ToString() ??
                                      property.OldValue.ToString()
                                    : "",
                                property.NewValue != null
                                    ? propType.GetProperty("Id")?.GetValue(property.NewValue)?.ToString() ??
                                      property.NewValue.ToString()
                                    : "",
                                propInfo
                            );
                            propertyChanges.Add(propchange);
                        }

                        if (!AddAuditedAsEvent(propInfo, property, propchange, entityChange, entity))
                        {
                            var displayProperty = propType.GetProperties().FirstOrDefault(x => x.HasAttribute<EntityDisplayNameAttribute>());

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

                        EntityPropertyChange? propchange = null;
                        // skip creating property changes
                        if (propInfo.GetCustomAttribute<AuditedAsEventAttribute>()?.SaveFullInfo ?? true)
                        {
                            // Get Reference List item values
                            var refListProperty = propInfo.GetReferenceListIdentifierOrNull();
                            if (refListProperty != null)
                            {
                                oldValue = property.OldValue != null
                                    ? _refListHelper.GetItemDisplayText(new ReferenceListIdentifier(refListProperty.Module, refListProperty.Name), GetRefListValue(property.OldValue))
                                    : null;
                                newValue = property.NewValue != null
                                    ? _refListHelper.GetItemDisplayText(new ReferenceListIdentifier(refListProperty.Module, refListProperty.Name), GetRefListValue(property.NewValue))
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
                                var description = newValue != null && (bool)newValue ? attr.TrueText : attr.FalseText;
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

        private Int64? GetRefListValue(Object value) 
        {
            if (value == null)
                return null;

            var valueType = value.GetType();
            return valueType.IsEnum
                ? Convert.ToInt64(Convert.ChangeType(value, Enum.GetUnderlyingType(valueType)))
                : Convert.ToInt64(value);
        }

        private bool AddAuditedAsEvent(PropertyInfo propInfo, DirtyPropertyInfo property, EntityPropertyChange? propertyChange, EntityChange entityChange, object entity)
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

                    if (enentInfo == null)
                        return false;

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

        public bool AddAuditedAsManyToMany(object entity, PropertyInfo propInfo, object? oldValue, object? newValue)
        {
            // resolve here because EntityHistoryHelper can be resolved befeore IAbpSession registered
            var abpSession = _iocResolver.Resolve<IAbpSession>();

            var entityType = entity.GetType().StripCastleProxyType();
            var propertyType = propInfo.PropertyType.IsListType() && propInfo.PropertyType.IsGenericType 
                ? propInfo.PropertyType.GetGenericArguments()[0] 
                : propInfo.PropertyType;

            var entityConfig = AsyncHelper.RunSync(async () => await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(entityType.Namespace.NotNull(), entityType.Name));

            var configuredAudit = entityConfig != null && (entityConfig.Properties.FirstOrDefault(x => x.Name.ToCamelCase() == propInfo.Name.ToCamelCase())?.Audited ?? false);
            var audited = propInfo.GetCustomAttribute<AuditedAttribute>();
            var auditedAsMany = propInfo.GetCustomAttribute<AuditedAsManyToManyAttribute>();
            var auditedAsP = propInfo.GetCustomAttributes().FirstOrDefault(x => x.GetType().FindBaseGenericType(typeof(AuditedAsManyToManyAttribute<,,>)) != null)?.GetType();
            var auditedAsPC = propInfo.GetCustomAttributes().FirstOrDefault(x => x.GetType().FindBaseGenericType(typeof(AuditedAsManyToManyAttribute<,,,>))!= null)?.GetType();

            var defaultCreatorType = typeof(EntityHistoryEventCreatorBase<,>).MakeGenericType(entityType, propertyType);

            var parentCreator = configuredAudit || audited != null || auditedAsMany != null
                ? defaultCreatorType
                : auditedAsPC?.GetGenericArguments()[0] ?? auditedAsP?.GetGenericArguments()[0];

            var childCreator = auditedAsMany != null ? defaultCreatorType : auditedAsPC?.GetGenericArguments()[1];

            var entityTypeAttr = auditedAsPC?.GetGenericArguments()[2] ?? auditedAsP?.GetGenericArguments()[1];
            var propertyTypeAttr = auditedAsPC?.GetGenericArguments()[3] ?? auditedAsP?.GetGenericArguments()[2];


            var entityChangesInfo = new EntityChangesInfo()
            {
                Entity = entity,
                DateTime = DateTime.Now,
                OldValue = oldValue,
                NewValue = newValue,
                Property = propInfo,
            };

            if (parentCreator != null)
            {
                // Try to start Event creator from the property attribute
                if (Activator.CreateInstance(parentCreator) is IEntityHistoryEventCreator parentInstance)
                {
                    var eventInfo = parentInstance.CreateManyToManyEvent(entityChangesInfo);

                    if (eventInfo == null)
                        return false;

                    var id = entity.GetId().NotNull().ToString();

                    var entityChange = new EntityChange
                    {
                        ChangeType = EntityChangeType.Updated,
                        ChangeTime = Clock.Now,
                        EntityEntry = entity, // [NotMapped]
                        EntityId = id,
                        EntityTypeFullName = entityType.StripCastleProxyType().FullName,
                        TenantId = abpSession?.TenantId,
                    };
                    EntityChanges.Add(entityChange);

                    EntityHistoryEvents.Add(new EntityHistoryEvent()
                    {
                        Description = eventInfo.Description,
                        PropertyName =
                            propInfo.Name.TruncateWithPostfix(EntityPropertyChange.MaxPropertyNameLength),
                        EventName = eventInfo.EventName,
                        EventType = string.IsNullOrEmpty(eventInfo.EventType) ? EntityHistoryCommonEventTypes.ENTITY_EVENT : eventInfo.EventType,
                        EntityChange = entityChange
                    });
                }
            }

            if (childCreator != null)
            {
                // Try to start Event creator from the property attribute
                if (Activator.CreateInstance(childCreator) is IEntityHistoryEventCreator childInstance)
                {
                    var (addItem, removeItem) = childInstance.GetListNewAndRemoved(entityChangesInfo);
                    
                    if (addItem.Any() || removeItem.Any())
                    {
                        foreach (var add in addItem)
                        {
                            var entityChange = new EntityChange
                            {
                                ChangeType = EntityChangeType.Updated,
                                ChangeTime = Clock.Now,
                                EntityEntry = add, // [NotMapped]
                                EntityId = add.GetId()?.ToString(),
                                EntityTypeFullName = propertyType.StripCastleProxyType().FullName,
                                TenantId = abpSession?.TenantId,
                            };
                            EntityChanges.Add(entityChange);

                            var enentInfo = childInstance.CreateManyToManyRelationEvent(new EntityChangesInfo()
                            {
                                Entity = entity,
                                DateTime = DateTime.Now,
                                OldValue = null,
                                NewValue = add,
                                Property = propInfo,
                            });

                            if (enentInfo != null)
                                EntityHistoryEvents.Add(new EntityHistoryEvent()
                                {
                                    Description = enentInfo.Description,
                                    EventName = enentInfo.EventName,
                                    EventType = string.IsNullOrEmpty(enentInfo.EventType) ? EntityHistoryCommonEventTypes.ENTITY_EVENT : enentInfo.EventType,
                                    EntityChange = entityChange
                                });
                        }
                        foreach (var remove in removeItem)
                        {
                            var entityChange = new EntityChange
                            {
                                ChangeType = EntityChangeType.Updated,
                                ChangeTime = Clock.Now,
                                EntityEntry = remove, // [NotMapped]
                                EntityId = remove.GetId()?.ToString(),
                                EntityTypeFullName = propertyType.StripCastleProxyType().FullName,
                                TenantId = abpSession?.TenantId,
                            };
                            EntityChanges.Add(entityChange);

                            var enentInfo = childInstance.CreateManyToManyRelationEvent(new EntityChangesInfo()
                            {
                                Entity = entity,
                                DateTime = DateTime.Now,
                                OldValue = remove,
                                NewValue = null,
                                Property = propInfo,
                            });

                            if (enentInfo != null)
                                EntityHistoryEvents.Add(new EntityHistoryEvent()
                                {
                                    Description = enentInfo.Description,
                                    EventName = enentInfo.EventName,
                                    EventType = string.IsNullOrEmpty(enentInfo.EventType) ? EntityHistoryCommonEventTypes.ENTITY_EVENT : enentInfo.EventType,
                                    EntityChange = entityChange
                                });
                        }
                    }
                    return true;
                }
            }

            return false;
        }

        private EntityPropertyChange CreateEntityPropertyChange(object? oldValue, object? newValue, PropertyInfo propertyInfo)
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

        public virtual EntityChangeSet? CreateEntityChangeSet()
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
            var entityHistoryEvents = EntityHistoryEvents.Where(x => !string.IsNullOrEmpty(x.PropertyName) && 
                    x.EntityChange != null && 
                    x.EventType != EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT)
                .ToList();
            foreach (var entityHistoryEvent in entityHistoryEvents)
            {
                var prop = EntityChanges
                    .FirstOrDefault(x =>
                        x.EntityId == entityHistoryEvent.EntityChange.NotNull().EntityId
                        && x.EntityTypeFullName == entityHistoryEvent.EntityChange.EntityTypeFullName
                        && x.PropertyChanges != null)
                    ?.PropertyChanges.FirstOrDefault(x => x.PropertyName == entityHistoryEvent.PropertyName);

                if (prop != null)
                {
                    entityHistoryEvent.EntityPropertyChange = prop;

                    if (entityHistoryEvent.EntityChange != null)
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

                _historyStore.Save(changeSet);
                EntityHistoryEvents.ForEach(e => _historyEventRepository.Insert(e));
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