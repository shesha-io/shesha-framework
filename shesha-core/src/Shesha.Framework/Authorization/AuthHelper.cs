using Abp.Authorization;
using Abp.Runtime.Security;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Shesha.Authorization.Users;
using Shesha.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public static class AuthHelper
    {
        /// <summary>
        /// Checks if the current user has at least one of the specified permissions
        /// </summary>
        /// <param name="httpContext"></param>
        /// <param name="permissionNames"></param>
        /// <returns></returns>
        public static async Task<bool> AnyPermissionGrantedAsync(this HttpContext httpContext, params string[] permissionNames)
        {
            var result = await httpContext.AuthenticateAsync("JwtBearer");
            if (!result.Succeeded)
                return false;

            var principal = result.Principal;
            if (principal == null)
                return false;

            var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == AbpClaimTypes.UserId);
            if (userIdClaim == null || !Int64.TryParse(userIdClaim.Value, out var userId))
                return false;

            AuthenticationProperties props = result.Properties;

            var userManager = StaticContext.IocManager.Resolve<UserManager>();
            var user = await userManager.GetUserByIdAsync(userId);

            if (user == null)
                return false;

            var session = StaticContext.IocManager.Resolve<IAbpSession>();
            var isGranted = false;
            using (session.Use(user.TenantId, user.Id))
            {
                var permissionChecker = StaticContext.IocManager.Resolve<IPermissionChecker>();
                if (permissionChecker == null)
                    return false;

                foreach (var permissionName in permissionNames)
                {
                    isGranted = await permissionChecker.IsGrantedAsync(permissionName);
                    if (isGranted)
                        break;
                }
            }

            return isGranted;
        }
    }
}
