using Microsoft.AspNetCore.Http;
using Shesha.Configuration.Security;
using System.Threading.Tasks;

namespace Shesha.Swagger
{
    /// <summary>
    /// Middleware that blocks access to Swagger UI and Swagger JSON endpoints
    /// when the Swagger UI setting is disabled, returning a blank page instead.
    /// </summary>
    public class SwaggerUiAccessMiddleware
    {
        private readonly RequestDelegate _next;

        public SwaggerUiAccessMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                if (context.RequestServices.GetService(typeof(ISecuritySettings)) is ISecuritySettings securitySettings)
                {
                    var settings = await securitySettings.SecuritySettings.GetValueAsync();
                    if (!settings.SwaggerUiEnabled)
                    {
                        context.Response.StatusCode = StatusCodes.Status200OK;
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync("<!DOCTYPE html><html><head></head><body></body></html>");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
