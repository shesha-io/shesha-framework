using Abp.Dependency;
using Microsoft.OpenApi.Models;
using Shesha.Configuration.Security;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Shesha.Swagger
{
    /// <summary>
    /// Document filter that removes all API documentation when the Swagger UI setting is disabled
    /// </summary>
    public class SwaggerUiDocumentFilter : IDocumentFilter
    {
        private readonly IIocManager _iocManager;

        public SwaggerUiDocumentFilter(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var securitySettings = _iocManager.Resolve<ISecuritySettings>();
            var swaggerEnabled = AsyncHelper.RunSync(() => securitySettings.SwaggerUiEnabled.GetValueAsync());

            if (swaggerEnabled) return;
            swaggerDoc.Paths.Clear();
            swaggerDoc.Components.Schemas.Clear();
        }
    }
}
