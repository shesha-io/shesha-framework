using Abp.Dependency;
using Abp.Reflection;
using Shesha.Configuration.MappingMetadata;
using Shesha.Configuration.Runtime.Exceptions;
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

        private readonly IDictionary<Type, EntityTypeConfiguration> _entityConfigurations = new Dictionary<Type, EntityTypeConfiguration>();
        private readonly ITypeFinder _typeFinder;
        private readonly IDynamicEntityTypeBuilder _dynamicEntityTypeBuilder;
        private readonly IMappingMetadataProvider _mappingMetadataProvider;
        private readonly IDynamicEntityUpdateHandler _dynamicEntityUpdateHandler;

        public EntityTypeConfigurationStore(
            ITypeFinder typeFinder,
            IDynamicEntityTypeBuilder dynamicEntityTypeBuilder,
            IMappingMetadataProvider mappingMetadataProvider,
            IDynamicEntityUpdateHandler dynamicEntityUpdateHandler
        )
        {
            _typeFinder = typeFinder;
            _dynamicEntityTypeBuilder = dynamicEntityTypeBuilder;
            _mappingMetadataProvider = mappingMetadataProvider;
            _dynamicEntityUpdateHandler = dynamicEntityUpdateHandler;

            InitializeHardcoded();
        }

        public void InitializeHardcoded(bool resetMapping = true)
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

            foreach (var entityType in entityTypes)
            {
                _entityByClassName.Add(entityType.Type.GetRequiredFullName(), entityType.Type);
                if (!string.IsNullOrWhiteSpace(entityType.TypeShortAlias))
                    _entityByTypeShortAlias.Add(entityType.TypeShortAlias, entityType.Type);
            }

            if (resetMapping)
                _mappingMetadataProvider.ResetMapping();
        }

        public async Task InitializeDynamicAsync()
        {
            var userEntityTypes = _dynamicEntityTypeBuilder.GenerateTypes(this);
            foreach (var entityType in userEntityTypes)
                _entityByClassName.Add(entityType.GetRequiredFullName(), entityType);
            
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
                    : null;
        }

        /// inheritedDoc
        public EntityTypeConfiguration? GetOrNull(string nameOrAlias)
        {
            var type = GetTypeOrNull(nameOrAlias);

            return type == null ? null : Get(type);
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

        public async Task ReInitializeAsync()
        {
            _entityByTypeShortAlias.Clear();
            _entityByClassName.Clear();
            _entityConfigurations.Clear();
            InitializeHardcoded(false);
            await InitializeDynamicAsync();
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
