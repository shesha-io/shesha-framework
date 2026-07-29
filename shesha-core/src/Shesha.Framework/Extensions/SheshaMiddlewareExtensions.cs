using Microsoft.AspNetCore.Builder;
using Shesha.ConfigurationItems;
using Shesha.DynamicEntities.Middleware;
using Shesha.Ioc;

namespace Shesha.Extensions
{
    /// <summary>
    /// Shesha middleware extensions
    /// </summary>
    public static class SheshaMiddlewareExtensions
    {
        /// <summary>
        /// Releases, at the end of every request, the components that were resolved via the root container
        /// during that request (see <see cref="ReleaseRequestScopeMiddleware"/>). Keeps Castle Windsor's
        /// release-policy dictionary bounded, fixing the root-resolve memory leak and its lock-contention
        /// slowdown. Register this as EARLY as possible in the pipeline so its cleanup wraps the whole request.
        /// </summary>
        public static IApplicationBuilder UseSheshaRequestScopeRelease(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ReleaseRequestScopeMiddleware>();
        }

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