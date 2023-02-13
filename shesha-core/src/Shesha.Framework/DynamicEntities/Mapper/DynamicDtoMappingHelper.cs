using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using AutoMapper;
using Shesha.AutoMapper;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Mapper
{
    public class DynamicDtoMappingHelper : IEventHandler<EntityChangedEventData<EntityProperty>>, IDynamicDtoMappingHelper, ITransientDependency
    {
        private readonly ICacheManager _cacheManager;
        private readonly IRepository<EntityProperty, Guid> _propertyRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IocManager _iocManager;

        public ITypedCache<string, List<MapperItem>> InternalCache
        {
            get
            {
                return _cacheManager.GetCache<string, List<MapperItem>>(this.GetType().Name);
            }
        }

        public DynamicDtoMappingHelper(
            IocManager iocManager,
            ICacheManager cacheManager,
            IRepository<EntityProperty, Guid> propertyRepository,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _iocManager = iocManager;
            _cacheManager = cacheManager;
            _propertyRepository = propertyRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }
        
        private string GetCacheKey(Type sourceType, Type destinationType)
        {
            if (sourceType.IsEntityType())
                return GetCacheKey(sourceType.Namespace, sourceType.Name);

            if (destinationType.IsEntityType())
                return GetCacheKey(destinationType.Namespace, destinationType.Name);

            throw new NotSupportedException("This method supports only mapping from/to entity type");
        }

        private string GetCacheKey(string @namespace, string name)
        {
            return $"{@namespace}.{name}";
        }

        private string GetCacheKey(EntityConfig entityConfig)
        {
            return GetCacheKey(entityConfig.Namespace, entityConfig.ClassName);
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            if (eventData.Entity?.EntityConfig == null)
                return;

            var cacheKey = GetCacheKey(eventData.Entity.EntityConfig);
            InternalCache.Remove(cacheKey);
        }

        private IMapper GetMapper(Type srcType, Type dstType) 
        {
            var modelConfigMapperConfig = new MapperConfiguration(cfg =>
            {
                var mapExpression = cfg.CreateMap(srcType, dstType);

                if (srcType.IsEntityType())
                    mapExpression.MapMultiValueReferenceListValuesToDto(srcType, dstType);
                if (dstType.IsEntityType())
                    mapExpression.MapMultiValueReferenceListValuesFromDto(srcType, dstType);

                var entityMapProfile = _iocManager.Resolve<EntityMapProfile>();
                cfg.AddProfile(entityMapProfile);

                var reflistMapProfile = _iocManager.Resolve<ReferenceListMapProfile>();
                cfg.AddProfile(reflistMapProfile);
            });

            var mapper = modelConfigMapperConfig.CreateMapper();
            return mapper;
        }

        public async Task<IMapper> GetEntityToDtoMapperAsync(Type entityType, Type dtoType)
        {
            return await GetMapperAsync(entityType, dtoType, MappingDirection.Entity2Dto);
        }

        public async Task<IMapper> GetDtoToEntityMapperAsync(Type entityType, Type dtoType)
        {
            return await GetMapperAsync(entityType, dtoType, MappingDirection.Dto2Entity);
        }

        private async Task<IMapper> GetMapperAsync(Type entityType, Type dtoType, MappingDirection direction)
        {
            var cacheKey = GetCacheKey(entityType, dtoType);

            var itemFactory = new Func<MapperItem>(() => {
                var autoMapper = direction == MappingDirection.Entity2Dto
                    ? GetMapper(entityType, dtoType)
                    : GetMapper(dtoType, entityType);
                var cacheItem = new MapperItem(dtoType, direction, autoMapper);
                return cacheItem;
            });

            IMapper mapper = null;

            var mappers = await InternalCache.GetAsync(cacheKey, () => {
                var cacheItem = itemFactory();
                mapper = cacheItem.Mapper;

                return Task.FromResult(new List<MapperItem>() { cacheItem });
            });

            // if the mapper was created during the cache creation - return it without search
            if (mapper != null)
                return mapper;

            // if mapper already cached - return from cache
            var cacheItem = mappers.FirstOrDefault(m => m.Direction == direction && m.DtoType == dtoType);
            if (cacheItem != null)
                return cacheItem.Mapper;

            // cache exists but it doesn't contain mapper for specified DTO - create it and update cache
            cacheItem = itemFactory();
            mappers.Add(itemFactory());
            await InternalCache.SetAsync(cacheKey, mappers);

            return cacheItem.Mapper;
        }

        public enum MappingDirection 
        { 
            Dto2Entity,
            Entity2Dto
        }

        public class MapperItem
        { 
            public Type DtoType { get; set; }
            public MappingDirection Direction { get; set; }
            public IMapper Mapper { get; set; }

            public MapperItem(Type dtoType, MappingDirection direction, IMapper mapper)
            {
                DtoType = dtoType;
                Direction = direction;
                Mapper = mapper;
            }
        }
    }
}
