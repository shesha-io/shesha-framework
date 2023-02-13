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
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class EntityModelProvider : BaseModelProvider, ITransientDependency,
        IEventHandler<EntityChangedEventData<EntityConfig>>,
        IEventHandler<EntityChangingEventData<ConfigurationItem>>
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IUnitOfWorkManager _uowManager;

        public EntityModelProvider(
            ICacheManager cacheManager,
            IEntityConfigurationStore entityConfigurationStore,
            ITypeFinder typeFinder,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IUnitOfWorkManager uowManager
            ) : base(cacheManager)
        {
            _typeFinder = typeFinder;
            _entityConfigurationStore = entityConfigurationStore;
            _entityConfigRepository = entityConfigRepository;
            _uowManager = uowManager;
        }

        public void HandleEvent(EntityChangedEventData<EntityConfig> eventData)
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

        protected override Task<List<ModelDto>> FetchModelsAsync()
        {
            var types = _entityConfigRepository.GetAll().ToList()
                .Select(t =>
                {
                    var config = _entityConfigurationStore.GetOrNull(t.FullClassName);
                    return config == null && t.Source == Domain.Enums.MetadataSourceType.ApplicationCode
                        ? null
                        : new ModelDto
                        {
                            Suppress = t.Configuration.Suppress,
                            ClassName = t.FullClassName,
                            Type = config?.EntityType,
                            Description = t.Configuration?.Description ?? (config?.EntityType != null ? ReflectionHelper.GetDescription(config?.EntityType) : ""),
                            Alias = string.IsNullOrWhiteSpace(t.TypeShortAlias) ? config?.SafeTypeShortAlias : t.TypeShortAlias,
                        };
                })
                .Where(t => t != null)
                .ToList();

            return Task.FromResult(types);
        }
    }
}
