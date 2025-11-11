using Abp.Authorization;
using Abp.Dependency;
using Abp.Runtime.Session;
using Hangfire.Dashboard;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Authorization.Users;

namespace Shesha.Scheduler.Hangfire
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var username = context.GetHttpContext().GetUsernameFromJwtToken();

            if (string.IsNullOrEmpty(username) || string.IsNullOrWhiteSpace(username))
                return false;

            var userManager = IocManager.Instance.Resolve<UserManager>();
            var user = userManager.FindByNameOrEmail(username);

            if (user == null) 
                return false;

            var session = IocManager.Instance.Resolve<IAbpSession>();
            var isGranted = false;
            using (session.Use(user.TenantId, user.Id))
            {
                var permissionChecker = IocManager.Instance.Resolve<IPermissionChecker>();
                if (permissionChecker == null)
                    return false;

                isGranted = permissionChecker.IsGranted(PermissionNames.Pages_Hangfire);
            }

            return isGranted;
        }
    }
}
