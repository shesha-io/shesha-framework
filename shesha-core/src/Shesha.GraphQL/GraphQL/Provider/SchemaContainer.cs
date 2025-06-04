using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Extensions;
using Abp.Reflection;
using Abp.Runtime.Caching;
using GraphQL.Types;
using Shesha.Cache;
using Shesha.Domain;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.GraphQL.Provider.Schemas;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Provider
{
    public class SchemaContainer : CacheHolder<string, ISchema>, ISchemaContainer, ISingletonDependency, IEventHandler<EntityChangedEventData<EntityProperty>>
    {
        private readonly ICacheManager _cacheManager;
        private readonly IShaTypeFinder _shaTypeFinder;
        private readonly IServiceProvider _serviceProvider;
        private readonly Schema _defaultSchema;

        /// <summary>
        /// Custom schemas
        /// </summary>
        protected Dictionary<string, ISchema> CustomSchemas { get; set; }

        public SchemaContainer(
            IServiceProvider serviceProvider,
            IEnumerable<ISchema> customSchemas,
            ITypeFinder typeFinder,
            IShaTypeFinder shaTypeFinder,
            ICacheManager cacheManager): base($"{nameof(SchemaContainer)}Cache", cacheManager)
        {
            _defaultSchema = new Schema();
            _defaultSchema.Query = new EmptyQuery();
            _shaTypeFinder = shaTypeFinder;
            _cacheManager = cacheManager;
            _serviceProvider = serviceProvider;

            CustomSchemas = customSchemas.ToDictionary(
                keySelector: schema => schema.GetType().Name.RemovePostFix("Schema"),
                elementSelector: schema => schema);
        }

        private ISchema GetEntitySchema(string schemaName)
        {
            var entityType = _shaTypeFinder.Find(t => GetEntitySchemaName(t) == schemaName && t.IsEntityType()).FirstOrDefault();
            if (entityType == null)
                    return null;

            return Cache.Get(schemaName, sn => GetEntitySchema(entityType, _serviceProvider));
        }

        private static ISchema GetEntitySchema(Type entityType, IServiceProvider serviceProvider) 
        {
            var idType = entityType.GetEntityIdType();
            var schemaType = typeof(EntitySchema<,>).MakeGenericType(entityType, idType);

            var schema = Activator.CreateInstance(schemaType, serviceProvider);

            return (ISchema)schema;
        }

        /// <summary>
        /// Get schema name for specified <paramref name="entityType"/>
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <returns></returns>
        public static string GetEntitySchemaName(Type entityType) 
        {
            return GetEntitySchemaName(entityType.Name);
        }

        /// <summary>
        /// Get schema name for entity with the specified type name (<paramref name="entityTypeName"/>)
        /// </summary>
        /// <param name="entityTypeName">Type name of the entity</param>
        /// <returns></returns>
        public static string GetEntitySchemaName(string entityTypeName)
        {
            return StringHelper.ToCamelCase(entityTypeName);
        }

        public virtual Task<ISchema> GetOrDefaultAsync(string schemaName, string defaultSchemaName = null)
        {
            ISchema schema = null;
            if (!string.IsNullOrWhiteSpace(schemaName))
            {
                schema = CustomSchemas.ContainsKey(schemaName)
                    ? CustomSchemas[schemaName]
                    : GetEntitySchema(schemaName);
            }
            
            if (schema == null)
                schema = defaultSchemaName != null ? CustomSchemas[defaultSchemaName] : _defaultSchema;

            return Task.FromResult(schema);
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            if (eventData.Entity?.EntityConfig == null)
                return;

            Cache.Remove(GetEntitySchemaName(eventData.Entity.EntityConfig.ClassName));
        }

        public void RegisterCustomSchema(string name, ISchema schema)
        {
            CustomSchemas[name] = schema;
        }

        public override void Dispose()
        {
            base.Dispose();
            _defaultSchema?.Dispose();
        }
    }
}