using Microsoft.AspNetCore.Builder;
using Shesha.ConfigurationItems;

namespace Shesha.Extensions
{
    /// <summary>
    /// Shesha middleware extensions
    /// </summary>
    public static class SheshaMiddlewareExtensions
    {
        public static IApplicationBuilder UseConfigurationFramework(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ConfigurationFrameworkMiddleware>();
        }
    }
}