using Hangfire.Annotations;
using Hangfire.Dashboard;
using Shesha.Authorization;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Hangfire
{
    public class HangfireAsyncAuthorizationFilter : IDashboardAsyncAuthorizationFilter
    {
        public async Task<bool> AuthorizeAsync([NotNull] DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            return await httpContext.AnyPermissionGrantedAsync(PermissionNames.Hangfire_Dashboard);
        }
    }
}
