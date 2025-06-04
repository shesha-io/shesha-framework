using Abp.Dependency;
using Shesha.DynamicEntities.EntityTypeBuilder;
using Shesha.Swagger;
using Swashbuckle.AspNetCore.Swagger;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public class DynamicEntityUpdateEvent : IDynamicEntityUpdateEvent, ITransientDependency
    {
        private readonly ISwaggerProvider _swaggerProvider;

        public DynamicEntityUpdateEvent(
            ISwaggerProvider swaggerProvider
        ) 
        {
            _swaggerProvider = swaggerProvider;
        }

        public async Task ProcessAsync()
        {
            await SheshaActionDescriptorChangeProvider.RefreshControllersAsync();

            if (_swaggerProvider != null && _swaggerProvider is CachingSwaggerProvider cachedProvider)
                await cachedProvider.ClearCacheAsync();

        }
    }
}
