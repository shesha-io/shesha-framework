using Hangfire.Dashboard;
using Shesha.Authorization;

namespace ShaCompanyName.ShaProjectName.Hangfire
{
    /// <summary>
    /// Hangfire authorization filter
    /// </summary>
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            return context.GetHttpContext().GetUsernameFromJwtToken()?.Trim().ToLower() == "admin";
        }
    }
}
