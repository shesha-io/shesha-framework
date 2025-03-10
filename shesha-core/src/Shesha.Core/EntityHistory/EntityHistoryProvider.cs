﻿using Abp.Configuration;
using Abp.Dependency;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.EntityHistory
{
    public class EntityHistoryProvider : IEntityHistoryProvider, IPerWebRequestDependency
    {
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<EntityHistoryEvent, Guid> _eventRepository;
        private readonly IRepository<EntityChangeSet, long> _entityChangeSetRepository;
        private readonly IRepository<EntityChange, long> _entityChangeRepository;
        private readonly IRepository<EntityPropertyChange, long> _entityPropertyChangeRepository;
        private readonly IRepository<EntityHistoryItem, long> _entityHistoryItemRepository;

        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IEnumerable<IModelProvider> _modelProviders;

        private List<ModelDto> _models;

        public EntityHistoryProvider(
            IDynamicRepository dynamicRepository,
            IRepository<Person, Guid> personRepository,
            IRepository<EntityHistoryEvent, Guid> eventRepository,
            IRepository<EntityChangeSet, long> entityChangeSetRepository,
            IRepository<EntityChange, long> entityChangeRepository,
            IRepository<EntityPropertyChange, long> entityPropertyChangeRepository,
            IRepository<EntityHistoryItem, long> entityHistoryItemRepository,
            IRepository<Setting, long> settingRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IEnumerable<IModelProvider> modelProviders
        )
        {
            _dynamicRepository = dynamicRepository;
            _personRepository = personRepository;
            _eventRepository = eventRepository;
            _entityChangeSetRepository = entityChangeSetRepository;
            _entityPropertyChangeRepository = entityPropertyChangeRepository;
            _entityChangeRepository = entityChangeRepository;
            _entityHistoryItemRepository = entityHistoryItemRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _modelProviders = modelProviders;
        }

        private async Task<List<ModelDto>> GetAllModelsAsync()
        {
            if (_models != null)
                return _models;

            var models = new List<ModelDto>();
            foreach (var provider in _modelProviders)
            {
                models.AddRange(await provider.GetModelsAsync());
            }

            return _models = models.Where(x => !x.Suppress).ToList();
        }

        private async Task<Type?> GetContainerTypeAsync(string container)
        {
            var allModels = await GetAllModelsAsync();
            var models = allModels.Where(m => m.Alias == container || m.ClassName == container).ToList();

            if (models.Count() > 1)
                throw new DuplicateModelsException(models);

            return models.FirstOrDefault()?.Type;
        }

        public async Task<List<EntityHistoryItemDto>> GetAuditTrailAsync(string entityId, string entityTypeFullName, bool includeEventsOnChildEntities)
        {
            // disable SoftDeleteFilter to allow get deleted entities
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete)) 
            {
                var itemType = await GetContainerTypeAsync(entityTypeFullName);

                var history = new List<EntityHistoryItemDto>();

                var (audit, maxDate) = await GetEntityAuditAsync(itemType, entityId);

                // Add entity history
                history.AddRange(audit);

                if (itemType != null)
                {
                    // Add many-to-many related entities
                    history.AddRange(await GetManyToManyEntitiesAuditAsync(itemType, entityId));

                    // Add many-to-one related entities
                    history.AddRange(await GetManyToOneEntitiesAuditAsync(itemType, entityId));

                    // Add child audited properties
                    if (includeEventsOnChildEntities)
                        history.AddRange(await GetChildEntitiesAuditAsync(itemType, entityId));

                    // Add generic child entities
                    history.AddRange(GetGenericEntitiesAudit(itemType, entityId));

                    if (maxDate != DateTime.MaxValue)
                    {
                        history = history.Where(x => x.CreationTime <= maxDate).ToList();
                    }
                }
                history = history.OrderBy(x => x.CreationTime).ToList();

                return history;
            }            
        }

        private async Task<List<EntityHistoryItemDto>> GetChildEntitiesAuditAsync(Type itemType, string entityId)
        {
            var list = new List<EntityHistoryItemDto>();
            // Check if child audited properties should be displayed
            var childAuditedProperties = itemType.GetProperties()
                .Where(p => p.GetCustomAttribute<DisplayChildAuditTrailAttribute>() != null).ToList();

            if (childAuditedProperties?.Any() ?? false)
            {
                var item = await _dynamicRepository.GetAsync(itemType, entityId);
                foreach (var childAuditedProperty in childAuditedProperties)
                {
                    var childItem = childAuditedProperty.GetValue(item);
                    if (childItem != null)
                    {
                        var attr = childAuditedProperty.GetCustomAttribute<DisplayChildAuditTrailAttribute>().NotNull();
                        var propDisplayName = childAuditedProperty.GetCustomAttribute<DisplayAttribute>()?.Name ??
                                              childAuditedProperty.Name.ToFriendlyName();
                        var childType = childItem.GetType();
                        if (childType.GetInterfaces().Any(x => x.Name == "INHibernateProxy" || x.Name == "IFieldInterceptorAccessor"))
                        {
                            if (childType.BaseType != null)
                            {
                                // unproxy
                                childType = childType.BaseType;
                            }
                        }

                        var childId = childType.GetProperty("Id")?.GetValue(childItem)?.ToString();
                        var (audit, time) = await GetEntityAuditAsync(childType, childId, propDisplayName, attr.AuditedFields);
                        list.AddRange(audit);
                    }
                }
            }

            return list;
        }

        private async Task<(List<EntityHistoryItemDto>, DateTime)> GetEntityAuditAsync(Type? entityType, string? entityId, string childName = "", string[]? fields = null)
        {

            var maxDateTime = DateTime.MaxValue;
            var stopsAttrs = entityType?.GetCustomAttributes<PropertyChangeToStopAuditTrailAttribute>()
                .ToDictionary(x => x.PropertyName, x => x.PropertyValue)
                ?? new Dictionary<string, string>();

            var list = new List<EntityHistoryItemDto>();
            List<EntityChange> changes;
            if (entityType != null)
            {
                changes = await _entityChangeRepository.GetAllListAsync(x =>
                    x.EntityId == entityId && x.EntityTypeFullName == entityType.FullName);
            }
            else
            {
                changes = await _entityChangeRepository.GetAllListAsync(x => x.EntityId == entityId);
            }

            foreach (var entityChange in changes)
            {
                var changeSet = await _entityChangeSetRepository.GetAsync(entityChange.EntityChangeSetId);
                var username = GetPersonByUserId(changeSet?.UserId);

                entityType ??= await GetContainerTypeAsync(entityChange.EntityTypeFullName);

                var changeEvents = await _eventRepository.GetAllListAsync(x => x.EntityPropertyChange == null && x.EntityChange == entityChange);
                foreach (var entityHistoryEvent in changeEvents)
                {

                    if (fields != null && !fields.Contains(entityHistoryEvent.EventType)) continue;

                    list.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = (int?)EntityHistoryItemType.Event,
                        CreationTime = entityChange.ChangeTime,
                        EntityId = entityId,
                        EntityTypeFullName = entityType?.FullName,
                        EventType = entityHistoryEvent.EventType,
                        EventText = (entityHistoryEvent.EventName ?? $"{childName} Event").Trim(),
                        ExtendedDescription = entityHistoryEvent.Description,
                        UserFullName = username?.FullName ?? $"UserId: {changeSet?.UserId}"
                    });
                }

                var properties = await _entityPropertyChangeRepository.GetAllListAsync(x => x.EntityChangeId == entityChange.Id);

                var propsDescr = new List<string>();
                foreach (var propertyChange in properties)
                {
                    if (fields != null && !fields.Contains(propertyChange.PropertyName)) continue;

                    var propertyEvents = await _eventRepository.GetAllListAsync(x => x.EntityPropertyChange == propertyChange);
                    var propDescription = "";

                    var propAsEvent = propertyEvents.FirstOrDefault(x =>
                        x.EventType == EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT);
                    if (propAsEvent != null)
                    {
                        // Add separate event
                        list.Add(new EntityHistoryItemDto()
                        {
                            HistoryItemType = (int?)EntityHistoryItemType.Updated,
                            CreationTime = entityChange.ChangeTime,
                            EntityId = entityId,
                            EntityTypeFullName = entityType?.FullName,
                            EventType = propAsEvent.EventType,
                            EventText = (propAsEvent.EventName ?? $"{childName} Update").Trim(),
                            ExtendedDescription = propAsEvent.Description,
                            UserFullName = username?.FullName ?? $"UserId: {changeSet?.UserId}"
                        });

                        // To the next property
                        continue;
                    }

                    var propAsDescription = propertyEvents.FirstOrDefault(x =>
                        x.EventType == EntityHistoryCommonEventTypes.PROPERTY_CHANGE_FRIENDLY_TEXT
                        || x.EventType == EntityHistoryCommonEventTypes.PROPERTY_CHANGE_USER_TEXT);
                    if (propAsDescription != null)
                    {
                        propsDescr.Add(propAsDescription.Description ?? string.Empty);
                        continue;
                    }

                    var property = entityType?.GetProperty(propertyChange.PropertyName);
                    var propName = property != null
                        ? ReflectionHelper.GetDisplayName(property) ?? propertyChange.PropertyName
                        : propertyChange.PropertyName;

                    propDescription =
                        $"`{propName}` was changed from {propertyChange.OriginalValue} to {propertyChange.NewValue}";

                    foreach (var propEvent in propertyEvents.Where(x =>
                        x.EventType != EntityHistoryCommonEventTypes.PROPERTY_CHANGE_FRIENDLY_TEXT
                        && x.EventType != EntityHistoryCommonEventTypes.PROPERTY_CHANGE_USER_TEXT
                        && x.EventType != EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT
                        ))
                    {
                        propDescription = propDescription +
                            (!string.IsNullOrEmpty(propEvent.Description)
                                ? $"({propEvent.Description})"
                                : "");
                    }

                    propsDescr.Add(propDescription);

                    if (stopsAttrs.Count > 0
                        && stopsAttrs.GetValueOrDefault(propertyChange.PropertyName, "") == propertyChange.NewValue.Trim('"').Trim('\'').Trim('`')
                        && (
                            maxDateTime == DateTime.MaxValue
                            || maxDateTime > entityChange.ChangeTime
                        ))
                    {
                        maxDateTime = entityChange.ChangeTime;
                    }
                }

                var description = string.Join("; ", propsDescr.Where(x => !string.IsNullOrEmpty(x)));

                if (string.IsNullOrEmpty(description) && entityChange.ChangeType == EntityChangeType.Updated) continue;

                var itemEventText = "";

                switch (entityChange.ChangeType)
                {
                    case EntityChangeType.Created: itemEventText = string.IsNullOrEmpty(childName) ? "Created" : "Added"; break;
                    case EntityChangeType.Updated: itemEventText = "Updated"; break;
                    case EntityChangeType.Deleted: itemEventText = string.IsNullOrEmpty(childName) ? "Deleted" : "Removed"; break;
                }

                if (fields == null || fields.Contains(itemEventText))
                {
                    list.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = entityChange.ChangeType == EntityChangeType.Created
                            ? (int?)EntityHistoryItemType.Created
                            : (int?)EntityHistoryItemType.Updated,
                        CreationTime = entityChange.ChangeTime,
                        EntityId = entityId,
                        EntityTypeFullName = entityType?.FullName,
                        EventType = "",
                        EventText = ($"{childName} {itemEventText}").Trim(),
                        ExtendedDescription = entityChange.ChangeType == EntityChangeType.Created ? "" : description,
                        UserFullName = username?.FullName ?? $"UserId: {changeSet?.UserId}"
                    });
                }
            }

            if (fields == null || fields.Contains("Created"))
            {
                // If there is no Created record then get the create date stored in ICreationAudited entity
                if (list.All(x => x.HistoryItemType != (int?)EntityHistoryItemType.Created))
                {
                    try
                    {
                        if (entityType != null && Parser.CanParseId(entityId, entityType) &&
                            await _dynamicRepository.GetAsync(entityType, entityId) is ICreationAudited obj)
                        {
                            var createdBy = GetPersonByUserId(obj.CreatorUserId);
                            list.Add(new EntityHistoryItemDto()
                            {
                                HistoryItemType = (int?)EntityHistoryItemType.Created,
                                CreationTime = obj.CreationTime,
                                EntityTypeFullName = entityType?.FullName,
                                EntityId = entityId,
                                EventText = string.IsNullOrEmpty(childName) ? "Created" : "Added",
                                UserFullName = createdBy?.FullName ?? $"UserId: {obj.CreatorUserId}"
                            });
                        }
                    }
                    catch
                    {
                        // hide exception
                    }
                }
            }

            return (list, maxDateTime);
        }

        private async Task<List<EntityHistoryItemDto>> GetManyToManyEntitiesAuditAsync(Type itemType, string entityId)
        {
            var attrs = itemType.GetCustomAttributes<DisplayManyToManyAuditTrailAttribute>().ToList();

            var list = new List<EntityHistoryItemDto>();
            if (!attrs.Any()) return list;

            foreach (var attr in attrs)
            {
                var manyToManyType = attr.ManyToManyEntityType;

                var ownField = !string.IsNullOrEmpty(attr.OwnEntityField)
                    ? manyToManyType.GetProperty(attr.OwnEntityField)
                    : null;

                if (ownField == null)
                {
                    var ownFields = manyToManyType.GetProperties().Where(x => x.PropertyType.IsAssignableFrom(itemType)).ToList();
                    if (ownFields.Count() > 1)
                        throw new Exception($"Found more then 1 field with parent type {itemType.FullName}");
                    ownField = ownFields.FirstOrDefault();
                    if (ownField == null)
                        throw new Exception($"Filed with parent type {itemType.FullName} not found in many-to-many type {manyToManyType.FullName}");
                }

                var relatedType = attr.RelatedEntityType ?? manyToManyType.GetProperty(attr.RelatedEntityField)?.PropertyType;

                if (relatedType == null)
                    throw new Exception($"Related type of property {attr.RelatedEntityField} not found");

                var relatedNameField = string.IsNullOrEmpty(attr.NameField)
                    ? manyToManyType.GetProperties()
                          .FirstOrDefault(x => x.GetCustomAttribute<EntityDisplayNameAttribute>() != null)?.Name ?? ""
                    : attr.NameField;

                var relatedTypeFullName = relatedType.FullName;

                var displayName = string.IsNullOrEmpty(attr.DisplayName)
                    ? relatedType.GetCustomAttribute<EntityAttribute>()?.FriendlyName
                    : attr.DisplayName;
                displayName = string.IsNullOrEmpty(displayName)
                    ? relatedType.Name.ToFriendlyName()
                    : displayName;

                var parameterExpression = Expression.Parameter(manyToManyType, "x");
                var memberExpression = Expression.PropertyOrField(parameterExpression, ownField.Name);
                var idExpression = Expression.PropertyOrField(memberExpression, "Id");
                var action = Expression.Equal(idExpression, Expression.Constant(Guid.Parse(entityId)));
                var lambda = Expression.Lambda(action, parameterExpression);

                var res = await _dynamicRepository.Where(manyToManyType, lambda).ToDynamicListAsync();

                var childItems = res
                    .Select(x =>
                        new Relation()
                        {
                            Id = manyToManyType.GetProperty("Id")?.GetValue(x)?.ToString(),
                            RelatedObject = x.ForceCast<IFullAudited>(),
                            InnerObject = manyToManyType.GetProperty(attr.RelatedEntityField)?.GetValue(x) as IFullAudited,
                        })
                    .Select(x =>
                    {
                        x.InnerObjectId = relatedType.GetProperty("Id")?.GetValue(x.InnerObject)?.ToString();
                        x.Name = GetEntityName(x.InnerObject, relatedNameField);
                        return x;
                    })
                    .ToList();

                // TODO: Alex, please review. The logic is not clear here
#pragma warning disable CS8602
                var userIds = childItems.Select(x => x.RelatedObject.CreatorUserId).ToList();
                userIds.AddRange(childItems.Select(x => x.RelatedObject.DeleterUserId));
                userIds.AddRange(childItems.Select(x => x.InnerObject.DeleterUserId));
                userIds = userIds.Distinct().Where(x => x != null).ToList();
                var persons = await _personRepository.GetAll().Where(x => x.User != null && userIds.Contains(x.User.Id)).ToListAsync();

                foreach (var childItem in childItems)
                {
                    var createdBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.CreatorUserId);
                    list.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = (int?)EntityHistoryItemType.Added,
                        CreationTime = childItem.RelatedObject.CreationTime,
                        EntityTypeFullName = relatedTypeFullName,
                        EntityId = childItem.Id,
                        EventText = $"`{displayName}` added",
                        ExtendedDescription = childItem.Name,
                        UserFullName = createdBy?.FullName ?? $"UserId: {childItem.RelatedObject.CreatorUserId}"
                    });

                    if (childItem.RelatedObject.IsDeleted)
                    {
                        var deletedBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.DeleterUserId);
                        list.Add(new EntityHistoryItemDto()
                        {
                            HistoryItemType = (int?)EntityHistoryItemType.Removed,
                            CreationTime = childItem.RelatedObject.DeletionTime,
                            EntityTypeFullName = relatedTypeFullName,
                            EntityId = childItem.Id,
                            EventText = $"`{displayName}` removed",
                            ExtendedDescription = childItem.Name,
                            UserFullName = deletedBy?.FullName ?? $"UserId: {childItem.RelatedObject.DeleterUserId}"
                        });
                    }
                    else
                    {
                        if (childItem.InnerObject.IsDeleted)
                        {
                            var deletedBy = GetPersonByUserIdInternal(persons, childItem.InnerObject.DeleterUserId);
                            list.Add(new EntityHistoryItemDto()
                            {
                                HistoryItemType = (int?)EntityHistoryItemType.Removed,
                                CreationTime = childItem.InnerObject.DeletionTime,
                                EntityTypeFullName = relatedTypeFullName,
                                EntityId = childItem.Id,
                                EventText = $"`{displayName}` removed",
                                ExtendedDescription = $"`{childItem.Name}` was deleted",
                                UserFullName = deletedBy?.FullName ?? $"UserId: {childItem.InnerObject.DeleterUserId}"
                            });
                        }
                    }
#pragma warning restore CS8602

                    var fields = new List<string>() { "Updated" };
                    fields.AddRange(attr.AuditedFields ?? new string[0]);

                    var (audit, time) = await GetEntityAuditAsync(attr.AnyRelatedEntityType ? null : relatedType, childItem.InnerObjectId, displayName, fields.ToArray());
                    list.AddRange(audit);
                }
            }

            return list;
        }

        private async Task<List<EntityHistoryItemDto>> GetManyToOneEntitiesAuditAsync(Type itemType, string entityId)
        {
            var attrs = itemType.GetCustomAttributes<DisplayManyToOneAuditTrailAttribute>().ToList();

            var list = new List<EntityHistoryItemDto>();
            if (!attrs.Any()) return list;

            foreach (var attr in attrs)
            {
                var manyToOneType = attr.ManyToOneEntityType;
                var manyToOneTypeFullName = manyToOneType.FullName;

                var ownField = !string.IsNullOrEmpty(attr.RelatedEntityField)
                    ? manyToOneType.GetProperty(attr.RelatedEntityField)
                    : null;

                if (ownField == null)
                {
                    var ownFields = manyToOneType.GetProperties().Where(x => x.PropertyType.IsAssignableFrom(itemType)).ToList();
                    if (ownFields.Count() > 1)
                        throw new Exception($"Found more then 1 field with parent type {itemType.FullName}");
                    ownField = ownFields.FirstOrDefault();
                    if (ownField == null)
                        throw new Exception($"Filed with parent type {itemType.FullName} not found in many-to-many type {manyToOneType.FullName}");
                }

                var relatedEntityField = ownField.Name;

                var entityIdJsonString = entityId.ToInt64() == 0 ? $"\"{entityId}\"" : entityId;

                var displayName = string.IsNullOrEmpty(attr.DisplayName)
                    ? manyToOneType.GetCustomAttribute<EntityAttribute>()?.FriendlyName
                    : attr.DisplayName;
                displayName = string.IsNullOrEmpty(displayName)
                    ? manyToOneType.Name.ToFriendlyName()
                    : displayName;

                var relatedNameField = string.IsNullOrEmpty(attr.NameField)
                    ? manyToOneType.GetProperties()
                          .FirstOrDefault(x => x.GetCustomAttribute<EntityDisplayNameAttribute>() != null)?.Name ?? ""
                    : attr.NameField;


                var changesAdded = await _entityHistoryItemRepository
                    .GetAllListAsync(x =>
                        x.NewValue == entityIdJsonString
                        && x.PropertyName == relatedEntityField
                        && x.EntityTypeFullName == manyToOneTypeFullName
                        );

                foreach (var entityHistoryItem in changesAdded)
                {
                    var relatedObject = await _dynamicRepository.GetAsync(manyToOneType, entityHistoryItem.EntityId);

                    var name = GetEntityName(relatedObject, relatedNameField);

                    list.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = (int?)EntityHistoryItemType.Added,
                        CreationTime = entityHistoryItem.CreationTime,
                        EntityTypeFullName = manyToOneTypeFullName,
                        EntityId = entityHistoryItem.EntityId,
                        EventText = $"`{displayName}` added",
                        ExtendedDescription = name,
                        UserFullName = string.IsNullOrEmpty(entityHistoryItem.UserFullName)
                            ? $"UserId: {entityHistoryItem.UserId}"
                            : entityHistoryItem.UserFullName
                    });
                }

                var changesRemoved = await _entityHistoryItemRepository
                    .GetAllListAsync(x =>
                        x.OriginalValue == entityIdJsonString
                        && x.PropertyName == relatedEntityField
                        && x.EntityTypeFullName == manyToOneTypeFullName
                    );

                foreach (var entityHistoryItem in changesRemoved)
                {
                    var relatedObject = await _dynamicRepository.GetAsync(manyToOneType, entityHistoryItem.EntityId);

                    var name = GetEntityName(relatedObject, relatedNameField);
                    ;

                    list.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = (int?)EntityHistoryItemType.Removed,
                        CreationTime = entityHistoryItem.CreationTime,
                        EntityTypeFullName = manyToOneTypeFullName,
                        EntityId = entityHistoryItem.EntityId,
                        EventText = $"`{displayName}` removed",
                        ExtendedDescription = name,
                        UserFullName = string.IsNullOrEmpty(entityHistoryItem.UserFullName)
                            ? $"UserId: {entityHistoryItem.UserId}"
                            : entityHistoryItem.UserFullName
                    });
                }

                var parameterExpression = Expression.Parameter(manyToOneType, "x");
                var memberExpression = Expression.PropertyOrField(parameterExpression, relatedEntityField);
                var idExpression = Expression.PropertyOrField(memberExpression, "Id");
                var action = Expression.Equal(idExpression, Expression.Constant(Guid.Parse(entityId)));
                var lambda = Expression.Lambda(action, parameterExpression);

                var res = await _dynamicRepository.Where(manyToOneType, lambda).ToDynamicListAsync();

                var childItems = res
                    .Select(x =>
                        new Relation()
                        {
                            Id = manyToOneType.GetProperty("Id")?.GetValue(x)?.ToString(),
                            RelatedObject = x.ForceCast<IFullAudited>(),
                            Name = GetEntityName(x, relatedNameField)
                        })
                    .ToList();

                var userIds = childItems.Select(x => x.RelatedObject.CreatorUserId).ToList();
                userIds.AddRange(childItems.Select(x => x.RelatedObject.DeleterUserId));
                userIds = userIds.Distinct().Where(x => x != null).ToList();
                var persons = await _personRepository.GetAll().Where(x => x.User != null && userIds.Contains(x.User.Id)).ToListAsync();

                foreach (var childItem in childItems)
                {
                    if (
                        list.Where(x =>
                                x.EntityId == childItem.Id
                                && x.EntityTypeFullName == manyToOneTypeFullName)
                            .OrderBy(x => x.CreationTime)
                            .FirstOrDefault()?.HistoryItemType != (int?)EntityHistoryItemType.Added
                    )
                    {
                        var createdBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.CreatorUserId);
                        list.Add(new EntityHistoryItemDto()
                        {
                            HistoryItemType = (int?)EntityHistoryItemType.Added,
                            CreationTime = childItem.RelatedObject.CreationTime,
                            EntityTypeFullName = manyToOneTypeFullName,
                            EntityId = childItem.Id,
                            EventText = $"`{displayName}` added",
                            ExtendedDescription = childItem.Name,
                            UserFullName = createdBy?.FullName ?? $"UserId: {childItem.RelatedObject.CreatorUserId}"
                        });
                    }

                    if (childItem.RelatedObject.IsDeleted)
                    {
                        if (
                            list.Where(x =>
                                    x.EntityId == childItem.Id
                                    && x.EntityTypeFullName == manyToOneTypeFullName)
                                .OrderBy(x => x.CreationTime)
                                .FirstOrDefault()?.HistoryItemType != (int?)EntityHistoryItemType.Removed
                        )
                        {
                            var deletedBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.DeleterUserId);
                            list.Add(new EntityHistoryItemDto()
                            {
                                HistoryItemType = (int?)EntityHistoryItemType.Removed,
                                CreationTime = childItem.RelatedObject.DeletionTime,
                                EntityTypeFullName = manyToOneTypeFullName,
                                EntityId = childItem.Id,
                                EventText = $"`{displayName}` removed",
                                ExtendedDescription = $"`{childItem.Name}` was deleted",
                                UserFullName = deletedBy?.FullName ?? $"UserId: {childItem.RelatedObject.DeleterUserId}"
                            });
                        }
                    }

                    var fields = new List<string>() { "Updated" };
                    fields.AddRange(attr.AuditedFields ?? new string[0]);

                    var (audit, time) = await GetEntityAuditAsync(manyToOneType, childItem.Id, childItem.Name, fields.ToArray());
                    list.AddRange(audit);
                }
            }

            return list;
        }


        private List<EntityHistoryItemDto> GetAuditedAsEvents(string entityTypeFullName, string entityId)
        {
            var events = _eventRepository.GetAllList(x =>
                    x.EntityChange != null
                    && x.EntityChange.EntityId == entityId
                    && x.EntityChange.EntityTypeFullName == entityTypeFullName
                    && x.EventType == EntityHistoryCommonEventTypes.PROPERTY_CHANGE_AS_EVENT
                    && x.EntityPropertyChange != null
                );

            return events.Select(x =>
            {
                var ecs = _entityChangeSetRepository.Get(x.EntityChange.NotNull().EntityChangeSetId);
                return new EntityHistoryItemDto()
                {
                    CreationTime = x.EntityChange.ChangeTime,
                    ExtendedDescription = x.Description,
                    EntityId = entityId,
                    EntityTypeFullName = entityTypeFullName,
                    EventText = x.EventName,
                    HistoryItemType = (int?)EntityHistoryItemType.Event,
                    UserFullName = GetPersonByUserId(ecs?.UserId)?.FullName ?? ecs?.ToString()
                };
            }
            ).ToList();
        }

        private List<EntityHistoryItemDto> GetGenericEntitiesAudit(Type itemType, string entityId)
        {
            var attrs = itemType.GetCustomAttributes<DisplayGenericEntitesAuditTrailAttribute>();

            var history = new List<EntityHistoryItemDto>();
            if (!attrs.Any()) return history;

            var typeShortAlias = itemType.GetCustomAttribute<EntityAttribute>()?.TypeShortAlias ?? itemType.FullName;

            foreach (var attr in attrs)
            {
                var childType = attr.EntityType;

                var ownerIdField = string.IsNullOrEmpty(attr.OwnerIdField) ? "OwnerId" : attr.OwnerIdField;
                var ownerTypeField = string.IsNullOrEmpty(attr.OwnerTypeField) ? "OwnerType" : attr.OwnerTypeField;

                var childNameField = string.IsNullOrEmpty(attr.NameField)
                    ? childType.GetProperties()
                          .FirstOrDefault(x => x.GetCustomAttribute<EntityDisplayNameAttribute>() != null)?.Name ?? ""
                    : attr.NameField;

                var displayName = string.IsNullOrEmpty(attr.DisplayName)
                    ? childType.GetCustomAttribute<EntityAttribute>()?.FriendlyName
                    : attr.DisplayName;
                displayName = string.IsNullOrEmpty(displayName)
                    ? childType.Name.ToFriendlyName()
                    : displayName;

                var childTypeFullName = childType.FullName;

                var parameterExpression = Expression.Parameter(childType, "x");
                var memberExpression1 = Expression.PropertyOrField(parameterExpression, ownerIdField);
                var action1 = Expression.Equal(memberExpression1, Expression.Constant(Guid.Parse(entityId)));
                var memberExpression2 = Expression.PropertyOrField(parameterExpression, ownerTypeField);
#pragma warning disable CS8604
                // TODO: Alex, please review. typeShortAlias may be null and it may breake the logic
                var action2 = Expression.Equal(memberExpression2, Expression.Constant(Guid.Parse(typeShortAlias)));
#pragma warning restore CS8604
                var andExpression = Expression.And(action1, action2);
                var lambda = Expression.Lambda(andExpression, parameterExpression);

                var res = _dynamicRepository.Where(childType, lambda).ToDynamicList();

                var childItems = res
                    .Select(x =>
                        new Relation()
                        {
                            Id = childType.GetProperty("Id")?.GetValue(x)?.ToString(),
                            RelatedObject = x.ForceCast<IFullAudited>(),
                            Name = GetEntityName(x, childNameField)
                        })
                    .ToList();

                var userIds = childItems.Select(x => x.RelatedObject.CreatorUserId).ToList();
                userIds.AddRange(childItems.Select(x => x.RelatedObject.DeleterUserId));
                userIds = userIds.Distinct().Where(x => x != null).ToList();
                var persons = _personRepository.GetAll().Where(x => x.User != null && userIds.Contains(x.User.Id)).ToList();

                foreach (var childItem in childItems)
                {
                    var createdBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.CreatorUserId);
                    history.Add(new EntityHistoryItemDto()
                    {
                        HistoryItemType = (int?)EntityHistoryItemType.Added,
                        CreationTime = childItem.RelatedObject.CreationTime,
                        EntityTypeFullName = childTypeFullName,
                        EntityId = childItem.Id,
                        EventText = $"`{displayName}` added",
                        ExtendedDescription = childItem.Name,
                        UserFullName = createdBy?.FullName ?? $"UserId: {childItem.RelatedObject.CreatorUserId}"
                    });

                    if (childItem.RelatedObject.IsDeleted)
                    {
                        var deletedBy = GetPersonByUserIdInternal(persons, childItem.RelatedObject.DeleterUserId);
                        history.Add(new EntityHistoryItemDto()
                        {
                            HistoryItemType = (int?)EntityHistoryItemType.Deleted,
                            CreationTime = childItem.RelatedObject.DeletionTime,
                            EntityTypeFullName = childTypeFullName,
                            EntityId = childItem.Id,
                            EventText = $"`{displayName}` deleted",
                            ExtendedDescription = childItem.Name,
                            UserFullName = deletedBy?.FullName ?? $"UserId: {childItem.RelatedObject.DeleterUserId}"
                        });
                    }
                }
            }

            return history;
        }

        private string GetEntityName(object? entity, string fieldName)
        {
            if (entity == null) return string.Empty;

            if (string.IsNullOrEmpty(fieldName))
                return entity.ToString() ?? string.Empty;

            var type = entity.GetType();

            var propValue = type.GetProperty(fieldName)?.GetValue(entity);
            var propText = propValue?.ToString();
            return !string.IsNullOrEmpty(propText)
                ? propText
                : string.Empty;
        }

        private Person? GetPersonByUserIdInternal(IList<Person> list, long? userId)
        {
            return userId != null
                ? list.FirstOrDefault(x => x.User != null && x.User.Id == userId)
                : null;
        }

        private Person? GetPersonByUserId(long? userId)
        {
            return userId != null
                ? _personRepository.GetAll().FirstOrDefault(x => x.User != null && x.User.Id == userId)
                : null;

        }

        private class Relation
        {
            public string? Id { get; set; }
            public IFullAudited RelatedObject { get; set; }
            public IFullAudited? InnerObject { get; set; }
            public string? InnerObjectId { get; set; }
            public string Name { get; set; }
        }
    }
}