using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Shesha.Configuration.MappingMetadata;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.EntityTypeBuilder;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Entities types (classes) configuration store
    /// </summary>
    public class EntityTypeConfigurationStore: IEntityTypeConfigurationStore, ISingletonDependency/*,
        IAsyncEventHandler<EntityChangedEventData<EntityProperty>>,
        IAsyncEventHandler<EntityChangedEventData<EntityConfig>>*/
    {
        private readonly Hashtable _entityByTypeShortAlias = new Hashtable();
        private readonly Hashtable _entityByClassName = new Hashtable();
        private readonly Hashtable _entityByEntityTypeId = new Hashtable();

        private readonly IDictionary<Type, EntityTypeConfiguration> _entityConfigurations = new Dictionary<Type, EntityTypeConfiguration>();
        private readonly ITypeFinder _typeFinder;
        private readonly IDynamicEntityTypeBuilder _dynamicEntityTypeBuilder;
        private readonly IMappingMetadataProvider _mappingMetadataProvider;
        private readonly IDynamicEntityUpdateHandler _dynamicEntityUpdateHandler;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;

        public EntityTypeConfigurationStore(
            ITypeFinder typeFinder,
            IDynamicEntityTypeBuilder dynamicEntityTypeBuilder,
            IMappingMetadataProvider mappingMetadataProvider,
            IDynamicEntityUpdateHandler dynamicEntityUpdateHandler,
            IRepository<EntityConfig, Guid> entityConfigRepository
        )
        {
            _typeFinder = typeFinder;
            _dynamicEntityTypeBuilder = dynamicEntityTypeBuilder;
            _mappingMetadataProvider = mappingMetadataProvider;
            _dynamicEntityUpdateHandler = dynamicEntityUpdateHandler;
            _entityConfigRepository = entityConfigRepository;
        }

        private string GetEntityTypeIdKey(string? module, string name) => $"{module}:{name}";

        [UnitOfWork]
        public async Task InitializeHardcodedAsync(bool resetMapping = true, List<EntityConfig>? entityConfigs = null)
        {
            var entityTypes = _typeFinder.FindAll().Where(t => t.IsEntityType() || t.IsJsonEntityType()) // && t != typeof(JsonEntity)) need to add JsonEntity for binding purposes
                .Select(t => new { Type = t, TypeShortAlias = t.GetAttributeOrNull<EntityAttribute>()?.TypeShortAlias ?? "" })
                .ToList();

            // check for duplicates
            var duplicates = entityTypes
                .Where(i => !string.IsNullOrWhiteSpace(i.TypeShortAlias))
                .GroupBy(i => i.TypeShortAlias, (t, items) => new {TypeShortAlias = t, Types = items.Select(i => i.Type)})
                .Where(g => g.Types.Count() > 1).ToList();
            if (duplicates.Any())
                throw new DuplicatedTypeShortAliasesException(duplicates.ToDictionary(i => i.TypeShortAlias ?? "empty", i => i.Types));

            entityConfigs = entityConfigs ?? await _entityConfigRepository.GetAllListAsync();

            foreach (var entityType in entityTypes)
            {
                var className = entityType.Type.GetRequiredFullName();
                _entityByClassName.Add(className, entityType.Type);
                var configs = entityConfigs.Where(x => x.FullClassName == className);
                foreach (var config in configs)
                    _entityByEntityTypeId.Add(GetEntityTypeIdKey(config.Module?.Name, config.Name), entityType.Type);
                if (!string.IsNullOrWhiteSpace(entityType.TypeShortAlias))
                    _entityByTypeShortAlias.Add(entityType.TypeShortAlias, entityType.Type);
            }

            if (resetMapping)
                _mappingMetadataProvider.ResetMapping();
        }

        [UnitOfWork]
        public async Task InitializeDynamicAsync(List<EntityConfig>? entityConfigs = null)
        {
            var userEntityTypes = await _dynamicEntityTypeBuilder.GenerateTypesAsync(this);
            entityConfigs = entityConfigs ?? await _entityConfigRepository.GetAllListAsync(x => x.Source == Domain.Enums.MetadataSourceType.UserDefined);
            foreach (var entityType in userEntityTypes)
            {
                var className = entityType.GetRequiredFullName();
                _entityByClassName.Add(className, entityType);
                var configs = entityConfigs.Where(x => x.FullClassName == className);
                foreach (var config in configs)
                    _entityByEntityTypeId.Add(GetEntityTypeIdKey(config.Module?.Name, config.Name), entityType);
            }

            _mappingMetadataProvider.ResetMapping();
            await _dynamicEntityUpdateHandler.ProcessAsync();
        }

        public string? GetEntityTypeAlias(Type entityType)
        {
            var entityConfig = Get(entityType);
            return entityConfig?.SafeTypeShortAlias;
        }

        private Type? GetTypeOrNull(string nameOrAlias) 
        {
            return _entityByTypeShortAlias.ContainsKey(nameOrAlias)
                ? _entityByTypeShortAlias[nameOrAlias] as Type
                : _entityByClassName.ContainsKey(nameOrAlias)
                    ? _entityByClassName[nameOrAlias] as Type
                    : _entityByEntityTypeId.ContainsKey(nameOrAlias)
                        ? _entityByEntityTypeId[nameOrAlias] as Type
                        : null;
        }

        /// inheritedDoc
        public EntityTypeConfiguration? GetOrNull(string nameOrAlias)
        {
            var type = GetTypeOrNull(nameOrAlias);
            return type == null ? null : Get(type);
        }

        /// inheritedDoc
        public EntityTypeConfiguration? GetOrNull(string? module, string name)
        {
            var type = GetTypeOrNull(GetEntityTypeIdKey(module, name));
            return type == null ? null : Get(type);
        }

        /// inheritedDoc
        public EntityTypeConfiguration Get(string? module, string name)
        {
            var key = GetEntityTypeIdKey(module, name);
            var type = GetTypeOrNull(key);

            if (type == null)
                throw new EntityTypeNotFoundException(key);

            return Get(type);
        }

        /// inheritedDoc
        public EntityTypeConfiguration Get(string nameOrAlias)
        {
            var type = GetTypeOrNull(nameOrAlias);

            if (type == null)
                throw new EntityTypeNotFoundException (nameOrAlias);

            return Get(type);
        }

        /// inheritedDoc
        public EntityTypeConfiguration Get(Type entityType)
        {
            var underlyingEntityType = entityType.StripCastleProxyType();

            if (!_entityConfigurations.TryGetValue(underlyingEntityType, out var config))
            {
                config = new EntityTypeConfiguration(underlyingEntityType);
                lock (_entityConfigurations)
                {
                    if (!_entityConfigurations.TryGetValue(underlyingEntityType, out _))
                    {
                        _entityConfigurations.Add(underlyingEntityType, config);
                    }
                }
            }
            return config;
        }

        public void SetDefaultAppService(Type entityType, Type applicationServiceType)
        {
            var config = Get(entityType);
            config.ApplicationServiceType = applicationServiceType;
        }

        [UnitOfWork]
        public async Task ReInitializeAsync()
        {
            _entityByTypeShortAlias.Clear();
            _entityByClassName.Clear();
            _entityByEntityTypeId.Clear();
            _entityConfigurations.Clear();
            var configs = await _entityConfigRepository.GetAllListAsync();
            await InitializeHardcodedAsync(false, configs);
            configs = configs.Where(x => x.Source == Domain.Enums.MetadataSourceType.UserDefined).ToList();
            await InitializeDynamicAsync(configs);
        }


        /*async Task IAsyncEventHandler<EntityChangedEventData<EntityProperty>>.HandleEventAsync(EntityChangedEventData<EntityProperty> eventData)
        {
            return await Task.Run(() =>
            {
                _entityByTypeShortAlias.Clear();
                _entityByClassName.Clear();
                _entityConfigurations.Clear();
                Initialize();
            });
        }

        Task IAsyncEventHandler<EntityChangedEventData<EntityConfig>>.HandleEventAsync(EntityChangedEventData<EntityConfig> eventData)
        {
            return await Task.Run(() =>
            {
                _entityByTypeShortAlias.Clear();
                _entityByClassName.Clear();
                _entityConfigurations.Clear();
                Initialize();
            });
        }*/
    }
}
