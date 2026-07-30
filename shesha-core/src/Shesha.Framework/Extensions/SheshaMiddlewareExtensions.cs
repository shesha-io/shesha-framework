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
        /// slowdown.
        /// <para>
        /// REQUIRED opt-in for the <c>RequestScopedReleasePolicy</c> installed by <c>SheshaFrameworkModule</c>:
        /// call this as the FIRST middleware in the host's Configure() pipeline (before Shesha middleware,
        /// routing, authentication and endpoints) so its cleanup wraps MVC authorization filters and ABP
        /// interceptors. If a host omits this call the policy harmlessly degrades to Castle's default
        /// (tracked-but-not-released) behaviour — the leak is simply not fixed, nothing breaks.
        /// </para>
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