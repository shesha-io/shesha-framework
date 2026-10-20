using Abp.Dependency;
using Microsoft.OpenApi;
using Shesha.Permissions;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Swagger
{
    public class SwaggerDocumentFilter : IDocumentAsyncFilter
    {
        private readonly IIocManager _iocManager;
        public SwaggerDocumentFilter(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public async Task ApplyAsync(OpenApiDocument swaggerDoc, DocumentFilterContext context, CancellationToken cancellationToken)
        {
            var pmo = _iocManager.Resolve<IPermissionedObjectManager>();

            foreach (var apiDescription in context.ApiDescriptions)
            {
                var toBeRemoved = EntityApiCrudHelper.IsRelatedToObsoleteEntity(apiDescription);
                toBeRemoved = toBeRemoved || EntityApiCrudHelper.IsApiTotallyDisabled(apiDescription);
                toBeRemoved = toBeRemoved || await EntityApiCrudHelper.IsApiDisabledByConfigAsync(apiDescription);
                toBeRemoved = toBeRemoved || !await pmo.IsActionDescriptorEnabledAsync(apiDescription.ActionDescriptor);

                if (toBeRemoved)
                    swaggerDoc.Paths.Remove($"/{apiDescription.RelativePath}");
            }
        }
    }
}
