using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class EntityModelProvider : BaseModelProvider<EntityModelDto>, IEntityModelProvider, ITransientDependency,
        IEventHandler<EntityChangedEventData<EntityProperty>>,
        IEventHandler<EntityChangingEventData<ConfigurationItem>>
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IMetadataProvider _metadataProvider;

        public EntityModelProvider(
            ICacheManager cacheManager,
            IEntityConfigurationStore entityConfigurationStore,
            ITypeFinder typeFinder,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IUnitOfWorkManager uowManager,
            IMetadataProvider metadataProvider
        ) : base(cacheManager)
        {
            _typeFinder = typeFinder;
            _entityConfigurationStore = entityConfigurationStore;
            _entityConfigRepository = entityConfigRepository;
            _uowManager = uowManager;
            _metadataProvider = metadataProvider;
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            AsyncHelper.RunSync(() => { return ClearCache(); });
        }

        public void HandleEvent(EntityChangingEventData<ConfigurationItem> eventData)
        {
            if (_entityConfigRepository.GetAll().Any(x => x.Id == eventData.Entity.Id))
            {
                AsyncHelper.RunSync(() => { return ClearCache(); });
            };
        }

        protected async override Task<List<EntityModelDto>> FetchModelsAsync()
        {
            var types = (await _entityConfigRepository.GetAll().ToListAsync())
                .Select(async t =>
                {
                    var config = _entityConfigurationStore.GetOrNull(t.FullClassName);

                    if (t.Source == Domain.Enums.MetadataSourceType.ApplicationCode
                        && (config == null || config.EntityType.FullName != t.FullClassName /*skip aliases*/))
                        return null;

                    var metadata = await _metadataProvider.GetAsync(t.FullClassName);
                    return new EntityModelDto
                    {
                        Suppress = t.Suppress,
                        ClassName = t.FullClassName,
                        Type = config?.EntityType,
                        Description = t.Description ?? (config?.EntityType != null ? ReflectionHelper.GetDescription(config?.EntityType) : ""),
                        Alias = string.IsNullOrWhiteSpace(t.TypeShortAlias) ? config?.SafeTypeShortAlias : t.TypeShortAlias,
                        Accessor = t.Accessor,
                        ModuleAccessor = t.Module?.Accessor,
                        Md5 = metadata.Md5,
                        ModificationTime = metadata.ChangeTime, // t.LastModificationTime ?? t.CreationTime,
                        Metadata = metadata,
                    };
                })
                .Select(t => t.Result)
                .Where(t => t != null)
                .ToList();

            return types;
        }
    }
}
