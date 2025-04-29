using Abp.Authorization;
using Abp.Runtime.Session;
using Hangfire.Dashboard;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Services;

namespace Shesha.Scheduler.Hangfire
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var username = context.GetHttpContext().GetUsernameFromJwtToken();

            if (string.IsNullOrEmpty(username) || string.IsNullOrWhiteSpace(username))
                return false;

            var iocResolver = StaticContext.IocManager;
            var userManager = iocResolver.Resolve<UserManager>();
            var user = userManager.FindByNameOrEmail(username);

            if (user == null) 
                return false;

            var session = iocResolver.Resolve<IAbpSession>();
            var isGranted = false;
            using (session.Use(user.TenantId, user.Id))
            {
                var permissionChecker = iocResolver.Resolve<IPermissionChecker>();
                if (permissionChecker == null)
                    return false;

                isGranted = permissionChecker.IsGranted(PermissionNames.Pages_Hangfire);
            }

            return isGranted;
        }
    }
}
