using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.ObjectMapping;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Cache
{
    public class EntityConfigCache : IEntityConfigCache, ITransientDependency,
        IEventHandler<EntityChangedEventData<EntityProperty>>,
        IEventHandler<EntityChangedEventData<EntityConfig>>,
        IEventHandler<EntityChangingEventData<ConfigurationItem>>
    {
        private readonly IRepository<EntityProperty, Guid> _propertyRepository;
        private readonly IRepository<EntityConfig, Guid> _configReprository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IObjectMapper _mapper;
        private readonly ITypeFinder _typeFinder;
        private readonly ITypedCache<string, EntityConfigCacheItem?> _propertyCache;

        public EntityConfigCache(
            IRepository<EntityProperty, Guid> propertyRepository,
            IRepository<EntityConfig, Guid> configReprository,
            IUnitOfWorkManager unitOfWorkManager,
            IObjectMapper mapper,
            ITypeFinder typeFinder,
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

        private async Task<EntityConfigCacheItem> FetchConfigAsync(Type entityType)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var properties = await _propertyRepository.GetAll()
                    .Where(p => p.EntityConfig.ClassName == entityType.Name && p.EntityConfig.Namespace == entityType.Namespace && p.ParentProperty == null)
                    .ToListAsync();
                var propertyDtos = properties.Select(p => _mapper.Map<EntityPropertyDto>(p)).ToList();

                var conf = await _configReprository.GetAll().Where(x => x.ClassName == entityType.Name && x.Namespace == entityType.Namespace).FirstOrDefaultAsync();
                var confDto = _mapper.Map<EntityConfigDto>(conf);

                await uow.CompleteAsync();

                return new EntityConfigCacheItem
                {
                    EntityConfig = confDto,
                    Properties = propertyDtos
                };
            }
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

        public void HandleEvent(EntityChangingEventData<ConfigurationItem> eventData)
        {
            var conf = _configReprository.GetAll().FirstOrDefault(x => x.Id == eventData.Entity.Id);
            if (conf != null)
            {
                _propertyCache.Remove(GetCacheKey(conf));
            };
        }

        public void HandleEvent(EntityChangedEventData<EntityConfig> eventData)
        {
            _propertyCache.Remove(GetCacheKey(eventData.Entity));
        }
    }
}