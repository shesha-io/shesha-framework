using Microsoft.OpenApi.Models;
using Shesha.Cache;

namespace Shesha.Swagger
{
    public interface ISwaggerDocumentCacheHolder : ICacheHolder<string, OpenApiDocument>
    {
    }
}
