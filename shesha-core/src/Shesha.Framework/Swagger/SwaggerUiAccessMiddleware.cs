using Microsoft.AspNetCore.Http;
using Shesha.Configuration.Security;
using System;
using System.Threading.Tasks;
using Abp.Dependency;
using Castle.Core.Logging;

namespace Shesha.Swagger
{
    /// <summary>
    /// Middleware that blocks access to Swagger when the Swagger UI setting is disabled,
    /// returning a 403 Forbidden response.
    /// </summary>
    /// <remarks>
    /// This covers everything under /swagger, including the generated JSON specification.
    /// Serving the spec while the UI is disabled would still expose the full API surface,
    /// which is what the setting exists to prevent. The spec is a build-time artefact for
    /// client generation, so nothing consumes it at runtime.
    /// </remarks>
    public class SwaggerUiAccessMiddleware: IMiddleware, ITransientDependency
    {
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var path = context.Request.Path;
            var isSwaggerUi = path.Value != null && path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase);

            if (isSwaggerUi)
            {
                try
                {
                    if (context.RequestServices.GetService(typeof(ISecuritySettings)) is not ISecuritySettings securitySettings)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return;
                    }
                    
                    var settings = await securitySettings.SecuritySettings.GetValueAsync();
                    if (!settings.SwaggerUiEnabled)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return;                                                               
                    }
                }
                catch (Exception e)
                {
                    Logger.Error("An error occurred while processing request.", e);
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return;     
                }
            }

            await next(context);
        }
    }
}
