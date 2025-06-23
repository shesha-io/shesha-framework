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
                    var fullClassName = t.Revision.FullClassName;
                    var config = _entityConfigurationStore.GetOrNull(fullClassName);

                    if (t.Revision.Source == Domain.Enums.MetadataSourceType.ApplicationCode
                        && (config == null || config.EntityType.FullName != fullClassName /*skip aliases*/))
                        return null;

                    var metadata = await _metadataProvider.GetAsync(config?.EntityType, fullClassName);
                    return new EntityModelDto
                    {
                        Suppress = t.Suppress,
                        ClassName = fullClassName,
                        Type = config?.EntityType,
                        Description = t.Revision.Description ?? (config != null && config.EntityType != null ? ReflectionHelper.GetDescription(config.EntityType) : ""),
                        Alias = string.IsNullOrWhiteSpace(t.Revision.TypeShortAlias) ? config?.SafeTypeShortAlias : t.Revision.TypeShortAlias,
                        Accessor = t.Revision.Accessor,
                        ModuleAccessor = t.Module?.Accessor,
                        Md5 = metadata.Md5,
                        ModificationTime = metadata.ChangeTime, // t.LastModificationTime ?? t.CreationTime,
                        Metadata = metadata,
                    };
                }))
                .WhereNotNull()
                .ToList();

            return dtos;
        }
    }
}