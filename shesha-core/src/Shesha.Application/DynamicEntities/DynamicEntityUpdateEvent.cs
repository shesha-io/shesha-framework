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
        private readonly ISwaggerProvider _swaggerProvider;
        private readonly IConfigureOptions<SwaggerGeneratorOptions> _swaggerOptions;
        private readonly IOptions<SwaggerGeneratorOptions> _options;
        private readonly IOptions<SwaggerGenOptions> _genOptions;

        public DynamicEntityUpdateEvent(
            ISwaggerProvider swaggerProvider,
            IConfigureOptions<SwaggerGeneratorOptions> swaggerOptions,
            IOptions<SwaggerGeneratorOptions> options,
            IOptions<SwaggerGenOptions> genOptions
        ) 
        {
            _swaggerProvider = swaggerProvider;
            _swaggerOptions = swaggerOptions;
            _options = options;
            _genOptions = genOptions;
        }

        public async Task ProcessAsync()
        {
            await SheshaActionDescriptorChangeProvider.RefreshControllersAsync();

            if (_swaggerProvider != null && _swaggerProvider is CachingSwaggerProvider cachedProvider)
                await cachedProvider.ClearCacheAsync();

            _genOptions.Value.AddDocumentsPerService();
            _swaggerOptions.Configure(_options.Value);
        }
    }
}
