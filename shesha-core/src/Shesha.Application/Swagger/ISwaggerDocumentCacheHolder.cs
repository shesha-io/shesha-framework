using Microsoft.OpenApi;
using Shesha.Cache;

namespace Shesha.Swagger
{
    public interface ISwaggerDocumentCacheHolder : ICacheHolder<string, OpenApiDocument>
    {
    }
}
