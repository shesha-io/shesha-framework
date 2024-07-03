using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Shesha.Domain;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Shesha.Swagger
{
    public class CachingSwaggerProvider : ISwaggerProvider, ITransientDependency,
        IEventHandler<EntityChangedEventData<EntityProperty>>,
        IEventHandler<EntityChangedEventData<EntityConfig>>,
        IEventHandler<EntityChangedEventData<PermissionedObject>>
    {
        private readonly ICacheManager _cacheManager;

        private readonly SwaggerGenerator _swaggerGenerator;

        /// <summary>
        /// Cache of the Swagger docs
        /// </summary>
        protected ITypedCache<string, OpenApiDocument> SwaggerCache => _cacheManager.GetCache<string, OpenApiDocument>("SwaggerCache");

        public CachingSwaggerProvider(
            IOptions<SwaggerGeneratorOptions> optionsAccessor,
            IApiDescriptionGroupCollectionProvider apiDescriptionsProvider,
            ISchemaGenerator schemaGenerator,
            ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
            _swaggerGenerator = new SwaggerGenerator(optionsAccessor.Value, apiDescriptionsProvider, schemaGenerator);
        }

        public OpenApiDocument GetSwagger(string documentName, string host = null, string basePath = null)
        {
            return SwaggerCache.Get(documentName, (_) => _swaggerGenerator.GetSwagger(documentName, host, basePath));
        }

        public void ClearCache()
        {
            SwaggerCache.Clear();
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            ClearCache();
        }

        public void HandleEvent(EntityChangedEventData<EntityConfig> eventData)
        {
            ClearCache();
        }

        public void HandleEvent(EntityChangedEventData<PermissionedObject> eventData)
        {
            ClearCache();
        }
    }
}
