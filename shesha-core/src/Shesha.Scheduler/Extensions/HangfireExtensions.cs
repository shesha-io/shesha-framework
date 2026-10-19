using Hangfire;
using Microsoft.AspNetCore.Builder;
using Shesha.Scheduler.Hangfire;

namespace Shesha.Scheduler.Extensions
{
    /// <summary>
    /// Hangfire extensions
    /// </summary>
    public static class HangfireExtensions
    {
        /// <summary>
        /// Use Shesha hangfire dashboard
        /// </summary>
        /// <param name="app">Application builder</param>
        /// <param name="path">Dashboard path</param>
        public static void UseSheshaHangfireDashboard(this IApplicationBuilder app, string path = "/hangfire") 
        {
            HangfireDashboardInfo.Path = path;
            app.UseHangfireDashboard(path,
                new DashboardOptions
                {
                    AsyncAuthorization = [new HangfireAsyncAuthorizationFilter()]
                });
            
        }
    }
}
