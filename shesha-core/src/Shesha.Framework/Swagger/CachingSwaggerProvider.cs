using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Shesha.Domain;
using Shesha.Permissions;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Threading.Tasks;

namespace Shesha.Swagger
{
    public class CachingSwaggerProvider:
        ISwaggerProvider,
        IAsyncEventHandler<EntityChangedEventData<EntityProperty>>,
        IAsyncEventHandler<EntityChangedEventData<EntityConfig>>,
        IAsyncEventHandler<EntityChangedEventData<PermissionedObject>>,
        ISingletonDependency
    {
        private readonly SwaggerGenerator _swaggerGenerator;
        private readonly ISwaggerDocumentCacheHolder _cacheHolder;

        public CachingSwaggerProvider(
            IOptions<SwaggerGeneratorOptions> optionsAccessor,
            ISwaggerDocumentCacheHolder cacheHolder,
            IIocResolver iocResolver)
        {
            var apiDescriptionsProvider = iocResolver.Resolve<IApiDescriptionGroupCollectionProvider>();

            var schemaGenerator = iocResolver.Resolve<ISchemaGenerator>();
            _swaggerGenerator = new SwaggerGenerator(optionsAccessor.Value, apiDescriptionsProvider, schemaGenerator);
            _cacheHolder = cacheHolder;
        }

        public OpenApiDocument GetSwagger(string documentName, string? host = null, string? basePath = null)
        {
            return _cacheHolder.Cache.Get(documentName, (_) => _swaggerGenerator.GetSwagger(documentName, host, basePath));
        }

        public async Task ClearCacheAsync() 
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityChangedEventData<EntityProperty> eventData)
        {
            await ClearCacheAsync();
        }

        public async Task HandleEventAsync(EntityChangedEventData<EntityConfig> eventData)
        {
            await ClearCacheAsync();
        }

        public async Task HandleEventAsync(EntityChangedEventData<PermissionedObject> eventData)
        {
            if (eventData.Entity.Type == ShaPermissionedObjectsTypes.EntityAction
                || eventData.Entity.Type == ShaPermissionedObjectsTypes.Entity
                || eventData.Entity.Type == ShaPermissionedObjectsTypes.WebApiAction
                || eventData.Entity.Type == ShaPermissionedObjectsTypes.WebApi)
                await _cacheHolder.Cache.ClearAsync();
        }        
    }
}
