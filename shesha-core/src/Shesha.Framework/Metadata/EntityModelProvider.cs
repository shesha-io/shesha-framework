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
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IMetadataProvider _metadataProvider;

        public EntityModelProvider(
            ICacheManager cacheManager,
            IEntityConfigurationStore entityConfigurationStore,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IMetadataProvider metadataProvider
        ) : base("EntityModelProviderCache", cacheManager)
        {
            _entityConfigurationStore = entityConfigurationStore;
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
            var entityConfigs = await _entityConfigRepository.GetAll().ToListAsync();
            var dtos = (await entityConfigs
                .SelectAsync(async t =>
                {
                    var config = _entityConfigurationStore.GetOrNull(t.FullClassName);

                    if (config == null || config.EntityType.FullName != t.FullClassName /*skip aliases*/)
                        return null;

                    var metadata = await _metadataProvider.GetAsync(config.EntityType);
                    // update module for dynamic entities
                    if (metadata.Module == null)
                    {
                        metadata.Module = t.Module?.Name;
                        metadata.ModuleAccessor = t.Module?.Accessor;
                    }
                    return new EntityModelDto
                    {
                        Suppress = t.Suppress,
                        ClassName = t.FullClassName,
                        Name = t.ClassName,
                        Type = config.EntityType,
                        Description = t.Description ?? (config.EntityType != null ? ReflectionHelper.GetDescription(config.EntityType) : ""),
                        Alias = string.IsNullOrWhiteSpace(t.TypeShortAlias) ? config.SafeTypeShortAlias : t.TypeShortAlias,
                        Accessor = t.Accessor,
                        ModuleAccessor = t.Module?.Accessor,
                        Md5 = metadata.Md5,
                        ModificationTime = metadata.ChangeTime,
                        Metadata = metadata,
                    };
                }))
                .WhereNotNull()
                .ToList();

            return dtos;
        }
    }
}