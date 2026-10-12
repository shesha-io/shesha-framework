using Abp.Dependency;
using Abp.Runtime.Caching;
using Microsoft.OpenApi.Models;
using Shesha.Cache;

namespace Shesha.Swagger
{

    public class SwaggerDocumentCacheHolder : CacheHolder<string, OpenApiDocument>, ISwaggerDocumentCacheHolder, ISingletonDependency
    {
        public SwaggerDocumentCacheHolder(ICacheManager cacheManager) : base("SwaggerDocumentCache", cacheManager)
        {
        }
    }
}
