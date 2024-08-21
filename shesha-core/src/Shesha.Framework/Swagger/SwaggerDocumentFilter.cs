using Abp.Dependency;
using Microsoft.OpenApi.Models;
using Shesha.Permissions;
using Shesha.Utilities;
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
                if (!AsyncHelper.RunSync(() => pmo.IsActionDescriptorEnabled(apiDescription.ActionDescriptor)))
                    swaggerDoc.Paths.Remove($"/{apiDescription.RelativePath}");
            }
        }
    }
}
