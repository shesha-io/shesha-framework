using Abp.Authorization;
using Abp.Runtime.Session;
using Hangfire.Annotations;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authentication;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Services;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Hangfire
{
    public class HangfireAsyncAuthorizationFilter : IDashboardAsyncAuthorizationFilter
    {
        public async Task<bool> AuthorizeAsync([NotNull] DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            var result = await httpContext.AuthenticateAsync("JwtBearer");
            if (!result.Succeeded)
                return false;

            var principal = result.Principal;
            if (principal == null)
                return false;
            var username = principal.Identity?.Name;

            AuthenticationProperties props = result.Properties;

            var userManager = StaticContext.IocManager.Resolve<UserManager>();
            var user = await userManager.FindByNameOrEmailAsync(username);

            if (user == null)
                return false;

            var session = StaticContext.IocManager.Resolve<IAbpSession>();
            var isGranted = false;
            using (session.Use(user.TenantId, user.Id))
            {
                var permissionChecker = StaticContext.IocManager.Resolve<IPermissionChecker>();
                if (permissionChecker == null)
                    return false;

                isGranted = await permissionChecker.IsGrantedAsync(PermissionNames.Pages_Hangfire);
            }

            return isGranted;
        }
    }
}
