using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Cache
{
    public class EntityConfigCache : IEntityConfigCache, ITransientDependency,
        IEventHandler<EntityChangedEventData<EntityProperty>>,
        IEventHandler<EntityChangedEventData<EntityConfig>>,
        IEventHandler<EntityChangingEventData<EntityConfig>>
    {
        private readonly IRepository<EntityProperty, Guid> _propertyRepository;
        private readonly IRepository<EntityConfig, Guid> _configReprository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IObjectMapper _mapper;
        private readonly IShaTypeFinder _typeFinder;
        private readonly ITypedCache<string, EntityConfigCacheItem?> _propertyCache;

        public EntityConfigCache(
            IRepository<EntityProperty, Guid> propertyRepository,
            IRepository<EntityConfig, Guid> configReprository,
            IUnitOfWorkManager unitOfWorkManager,
            IObjectMapper mapper,
            IShaTypeFinder typeFinder,
            IEntityConfigPropertyCacheHolder entityConfigPropertyCacheHolder
            )
        {
            _propertyRepository = propertyRepository;
            _configReprository = configReprository;
            _unitOfWorkManager = unitOfWorkManager;
            _mapper = mapper;
            _typeFinder = typeFinder;
            _propertyCache = entityConfigPropertyCacheHolder.Cache;
        }

        private string GetPropertiesCacheKey(Type entityType)
        {
            return GetCacheKey(entityType.Namespace, entityType.Name);
        }

        private string GetCacheKey(EntityConfig entityConfig)
        {
            return GetCacheKey(entityConfig.Namespace, entityConfig.ClassName);
        }

        private string GetCacheKey(string? @namespace, string name)
        {
            return $"{@namespace}.{name}";
        }

        private async Task<EntityConfigCacheItem?> FetchConfigAsync(Type entityType)
        {
            return await FetchConfigAsync(entityType.Namespace.NotNull(), entityType.Name);
        }
        private async Task<EntityConfigCacheItem?> FetchConfigAsync(string classNamespace, string className)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var conf = await _configReprository.GetAll()
                    .Where(x => x.ClassName == className && x.Namespace == classNamespace || x.TypeShortAlias == $"{classNamespace}.{className}")
                    .FirstOrDefaultAsync();

                // ToDo: AS - get nested properties

                if (conf == null)
                {
                    await uow.CompleteAsync();
                    return null;
                }

                var properties = await _propertyRepository.GetAll()
                    .Where(p => p.EntityConfig == conf && p.ParentProperty == null)
                    .ToListAsync();
                var propertyDtos = properties.Select(p => _mapper.Map<EntityPropertyDto>(p)).ToList();
                
                var confDto = _mapper.Map<EntityConfigDto>(conf);

                await uow.CompleteAsync();

                return new EntityConfigCacheItem
                {
                    EntityConfig = confDto,
                    Properties = propertyDtos
                };
            }
        }

        private (string classNamespace, string className) GetNamespaceAndClassName(string entityType)
        {
            if (entityType.IsNullOrWhiteSpace())
                return ("", "");
            var parts = entityType.Split('.').ToList();
            var className = parts.Last();
            parts.RemoveAt(parts.Count - 1);
            var classNamespace = string.Join('.', parts);
            return (classNamespace, className);
        }

        public async Task<EntityConfigDto?> GetDynamicSafeEntityConfigAsync(string entityType)
        {
            var item = await _propertyCache.GetAsync(entityType, async (entityType) =>
            {
                var eType = _typeFinder.Find(x => x.FullName == entityType).FirstOrDefault();
                if (eType == null) 
                {
                    var (classNamespace, className) = GetNamespaceAndClassName(entityType);
                    return await FetchConfigAsync(classNamespace, className);
                }
                else 
                    return await FetchConfigAsync(eType);
            });

            return item?.EntityConfig;
        }

        public async Task<List<EntityPropertyDto>?> GetDynamicSafeEntityPropertiesAsync(string entityType)
        {
            var item = await _propertyCache.GetAsync(entityType, async (entityType) =>
            {
                var eType = _typeFinder.Find(x => x.FullName == entityType).FirstOrDefault();
                if (eType == null)
                {
                    var (classNamespace, className) = GetNamespaceAndClassName(entityType);
                    return await FetchConfigAsync(classNamespace, className);
                }
                else
                    return await FetchConfigAsync(eType);
            });

            return item?.Properties;
        }

        public async Task<EntityConfigDto?> GetEntityConfigAsync(string entityType, bool raiseException = false)
        {
            var item = await _propertyCache.GetAsync(entityType, async (entityType) =>
            {
                var eType = _typeFinder.Find(x => x.FullName == entityType).FirstOrDefault();
                if (eType == null && raiseException)
                    throw new EntityNotFoundException($"Entity {entityType} not found");
                return eType == null 
                    ? null 
                    : await FetchConfigAsync(eType);
            });

            return item?.EntityConfig;
        }

        public async Task<EntityConfigDto?> GetEntityConfigAsync(Type entityType)
        {
            var key = GetPropertiesCacheKey(entityType);
            var item = await _propertyCache.GetAsync(key, async (key) =>
            {
                var item = await FetchConfigAsync(entityType);
                return item;
            });

            return item?.EntityConfig;
        }

        public async Task<List<EntityPropertyDto>?> GetEntityPropertiesAsync(string entityType, bool raiseException = false)
        {
            var item = await _propertyCache.GetAsync(entityType, async (entityType) =>
            {
                var eType = _typeFinder.Find(x => x.FullName == entityType).FirstOrDefault();
                if (eType == null && raiseException)
                    throw new EntityNotFoundException($"Entity {entityType} not found");
                return eType == null ? null : await FetchConfigAsync(eType);
            });
            return item?.Properties;
        }

        public async Task<List<EntityPropertyDto>?> GetEntityPropertiesAsync(Type entityType)
        {
            var key = GetPropertiesCacheKey(entityType);
            var item = await _propertyCache.GetAsync(key, async (key) =>
            {
                var item = await FetchConfigAsync(entityType);
                return item;
            });
            return item?.Properties;
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            if (eventData.Entity?.EntityConfig == null)
                return;

            _propertyCache.Remove(GetCacheKey(eventData.Entity.EntityConfig));
        }

        public void HandleEvent(EntityChangingEventData<EntityConfig> eventData)
        {
            _propertyCache.Remove(GetCacheKey(eventData.Entity));
        }

        public void HandleEvent(EntityChangedEventData<EntityConfig> eventData)
        {
            _propertyCache.Remove(GetCacheKey(eventData.Entity));
        }        
    }
}