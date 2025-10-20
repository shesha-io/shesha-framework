using Abp.Dependency;
using Microsoft.Extensions.Options;
using Shesha.DynamicEntities.EntityTypeBuilder;
using Shesha.Swagger;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public class DynamicEntityUpdateEvent : IDynamicEntityUpdateEvent, ITransientDependency
    {
        private readonly IIocResolver _iocResolver;
        

        public DynamicEntityUpdateEvent(IIocResolver iocResolver) 
        {
            _iocResolver = iocResolver;
        }

        public async Task ProcessAsync()
        {
            await SheshaActionDescriptorChangeProvider.RefreshControllersAsync();

            var swaggerProvider = RevolveOrNull<ISwaggerProvider>();
            if (swaggerProvider == null)
                return;

            if (swaggerProvider is CachingSwaggerProvider cachedProvider)
                await cachedProvider.ClearCacheAsync();

            var genOptions = RevolveOrNull<IOptions<SwaggerGenOptions>>();
            if (genOptions != null)
                genOptions.Value.AddDocumentsPerService();

            var swaggerOptions = RevolveOrNull<IConfigureOptions<SwaggerGeneratorOptions>>();
            var options = RevolveOrNull<IOptions<SwaggerGeneratorOptions>>();
            if (swaggerOptions != null && options != null)
                swaggerOptions.Configure(options.Value);
        }

        private T? RevolveOrNull<T>() where T: class
        {
            return _iocResolver.IsRegistered<T>() 
                ? _iocResolver.Resolve<T>() 
                : null;
        }
    }
}
