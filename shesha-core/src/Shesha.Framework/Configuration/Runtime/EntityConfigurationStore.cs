using Abp.Dependency;
using Abp.Reflection;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Reflection;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Entity configuration store
    /// </summary>
    public class EntityConfigurationStore: IEntityConfigurationStore, ISingletonDependency
    {
        private readonly Hashtable _entityByTypeShortAlias = new Hashtable();
        private readonly Hashtable _entityByClassName = new Hashtable();

        private readonly IDictionary<Type, EntityConfiguration> _entityConfigurations = new Dictionary<Type, EntityConfiguration>();
        private readonly ITypeFinder _typeFinder;

        public EntityConfigurationStore(ITypeFinder typeFinder)
        {
            _typeFinder = typeFinder;

            Initialise();
        }

        protected void Initialise()
        {
            var entityTypes = _typeFinder.FindAll().Where(t => t.IsEntityType() || t.IsJsonEntityType() && t != typeof(JsonEntity))
                .Select(t => new { Type = t, TypeShortAlias = t.GetAttribute<EntityAttribute>()?.TypeShortAlias })
                .ToList();

            // check for duplicates
            var duplicates = entityTypes
                .Where(i => !string.IsNullOrWhiteSpace(i.TypeShortAlias))
                .GroupBy(i => i.TypeShortAlias, (t, items) => new {TypeShortAlias = t, Types = items.Select(i => i.Type)})
                .Where(g => g.Types.Count() > 1).ToList();
            if (duplicates.Any())
                throw new DuplicatedTypeShortAliasesException(duplicates.ToDictionary(i => i.TypeShortAlias, i => i.Types));

            foreach (var entityType in entityTypes)
            {
                _entityByClassName.Add(entityType.Type.FullName, entityType.Type);
                if (!string.IsNullOrWhiteSpace(entityType.TypeShortAlias))
                    _entityByTypeShortAlias.Add(entityType.TypeShortAlias, entityType.Type);
            }
        }

        public string GetEntityTypeAlias(Type entityType)
        {
            var entityConfig = Get(entityType);
            return entityConfig?.TypeShortAlias;
        }

        private Type GetTypeOrNull(string nameOrAlias) 
        {
            return _entityByTypeShortAlias.ContainsKey(nameOrAlias)
                ? _entityByTypeShortAlias[nameOrAlias] as Type
                : _entityByClassName.ContainsKey(nameOrAlias)
                    ? _entityByClassName[nameOrAlias] as Type
                    : null;
        }

        /// inheritedDoc
        public EntityConfiguration GetOrNull(string nameOrAlias)
        {
            var type = GetTypeOrNull(nameOrAlias);

            return type == null ? null : Get(type);
        }

        /// inheritedDoc
        public EntityConfiguration Get(string nameOrAlias)
        {
            var type = GetTypeOrNull(nameOrAlias);

            if (type == null)
                throw new EntityTypeNotFoundException (nameOrAlias);

            return Get(type);
        }

        /// inheritedDoc
        public EntityConfiguration Get(Type entityType)
        {
            var underlyingEntityType = entityType.StripCastleProxyType();

            if (!_entityConfigurations.TryGetValue(underlyingEntityType, out var config))
            {
                config = new EntityConfiguration(underlyingEntityType);
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
    }
}
