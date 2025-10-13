using Abp.Dependency;
using Abp.Threading;
using Microsoft.OpenApi.Models;
using Shesha.Permissions;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Shesha.Swagger
{
    public class SwaggerDocumentFilter : IDocumentFilter
    {
        private readonly IIocManager _iocManager;
        public SwaggerDocumentFilter(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var pmo = _iocManager.Resolve<IPermissionedObjectManager>();

            foreach (var apiDescription in context.ApiDescriptions)
            {
                if (!AsyncHelper.RunSync(() => pmo.IsActionDescriptorEnabledAsync(apiDescription.ActionDescriptor)))
                    swaggerDoc.Paths.Remove($"/{apiDescription.RelativePath}");
            }
        }
    }
}
