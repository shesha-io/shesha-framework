using Microsoft.AspNetCore.Http;
using Shesha.Configuration.Security;
using System;
using System.Threading.Tasks;
using Castle.Core.Logging;

namespace Shesha.Swagger
{
    /// <summary>
    /// Middleware that blocks access to Swagger UI when the Swagger UI setting is disabled,
    /// returning a 403 Forbidden response. JSON spec endpoints are not blocked.
    /// </summary>
    public class SwaggerUiAccessMiddleware: IMiddleware
    {
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var path = context.Request.Path;
            var isSwaggerUi = path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase)
                              && path.Value != null
                              && !path.Value.EndsWith(".json", StringComparison.OrdinalIgnoreCase);

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
