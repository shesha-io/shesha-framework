using Abp.Dependency;
using Microsoft.OpenApi.Models;
using Shesha.Permissions;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Threading;
using System.Threading.Tasks;
using AsyncHelper = Abp.Threading.AsyncHelper;

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
            // TODO: migrate to IDocumentAsyncFilter after update of swashbuckle and remove AsyncHelper usage
            AsyncHelper.RunSync(() => ApplyAsync(swaggerDoc, context, CancellationToken.None));
        }

        private async Task ApplyAsync(OpenApiDocument swaggerDoc, DocumentFilterContext context, CancellationToken cancellationToken) 
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
