using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class EntityModelProvider : BaseModelProvider<EntityModelDto>, IEntityModelProvider, ISingletonDependency,
        IAsyncEventHandler<EntityChangedEventData<EntityProperty>>,
        IAsyncEventHandler<EntityChangingEventData<ConfigurationItem>>
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IEntityTypeConfigurationStore _entityTypesConfigurationStore;
        private readonly IMetadataProvider _metadataProvider;

        public EntityModelProvider(
            ICacheManager cacheManager,
            IEntityTypeConfigurationStore entityTypesConfigurationStore,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IMetadataProvider metadataProvider
        ) : base("EntityModelProviderCache", cacheManager)
        {
            _entityTypesConfigurationStore = entityTypesConfigurationStore;
            _entityConfigRepository = entityConfigRepository;
            _metadataProvider = metadataProvider;
        }

        public Task HandleEventAsync(EntityChangedEventData<EntityProperty> eventData)
        {
            return Cache.ClearAsync();
        }

        public Task HandleEventAsync(EntityChangingEventData<ConfigurationItem> eventData)
        {
            return Cache.ClearAsync();
        }

        protected async override Task<List<EntityModelDto>> FetchModelsAsync()
        {
            // Get all Entity configurations from DB (include exposed Entities)
            var entityConfigs = await _entityConfigRepository.GetAll().ToListAsync();
            var dtos = (await entityConfigs
                .SelectAsync(async entityConfig =>
                {
                    var config = _entityTypesConfigurationStore.GetOrNull(entityConfig.FullClassName);

                    if (config == null || config.EntityType.FullName != entityConfig.FullClassName /*skip aliases*/)
                        return null;

                    var metadata = await _metadataProvider.GetAsync(config.EntityType, entityConfig);
                    // update module for dynamic entities
                    if (metadata.Module == null)
                    {
                        metadata.Module = entityConfig.Module?.Name;
                        metadata.ModuleAccessor = entityConfig.Module?.Accessor;
                    }
                    return new EntityModelDto
                    {
                        Id = entityConfig.Id.ToString(),
                        Suppress = entityConfig.Suppress,
                        ClassName = entityConfig.FullClassName,
                        Name = entityConfig.ClassName,
                        Type = config.EntityType,
                        Description = entityConfig.Description ?? (config.EntityType != null ? ReflectionHelper.GetDescription(config.EntityType) : ""),
                        Alias = string.IsNullOrWhiteSpace(entityConfig.TypeShortAlias) ? config.SafeTypeShortAlias : entityConfig.TypeShortAlias,
                        Accessor = entityConfig.Accessor,
                        Module = entityConfig.Module?.Name,
                        ModuleAccessor = entityConfig.Module?.Accessor,
                        Md5 = metadata.Md5,
                        ModificationTime = metadata.ChangeTime,
                        Metadata = metadata,
                        IsExposed = entityConfig.IsExposed,
                    };
                }))
                .WhereNotNull()
                .ToList();

            return dtos;
        }
    }
}