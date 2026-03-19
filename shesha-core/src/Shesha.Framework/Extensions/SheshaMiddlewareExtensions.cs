using Microsoft.AspNetCore.Builder;
using Shesha.ConfigurationItems;
using Shesha.DynamicEntities.Middleware;

namespace Shesha.Extensions
{
    /// <summary>
    /// Shesha middleware extensions
    /// </summary>
    public static class SheshaMiddlewareExtensions
    {
        public static IApplicationBuilder UseConfigurationFramework(this IApplicationBuilder app)
        {
            return app
                .UseMiddleware<ConfigurationFrameworkMiddleware>()
                .UseMiddleware<RequestToGqlMiddleware>()
            ;
        }

        /// <summary>
        /// Adds security headers to the http context
        /// </summary>
        /// <param name="app"></param>
        /// <returns></returns>
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            return app.Use(async (context, next) =>
            {
                context.Response.Headers.XContentTypeOptions = "nosniff";
                context.Response.Headers.XFrameOptions = "DENY";
                context.Response.Headers.XXSSProtection = "0";
                context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
                await next(context);
            });
        }
    }
}