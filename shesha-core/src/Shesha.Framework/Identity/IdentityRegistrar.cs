using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Editions;
using Shesha.IdentityFramework;
using Shesha.MultiTenancy;

namespace Shesha.Identity
{
    public static class IdentityRegistrar
    {
        public static IdentityBuilder Register(IServiceCollection services)
        {
            services.AddLogging();

            return services.AddSheshaIdentity<Tenant, User, Role>()
                .AddAbpTenantManager<TenantManager>()
                .AddAbpUserManager<UserManager>()
                .AddAbpRoleManager<RoleManager>()
                .AddAbpEditionManager<EditionManager>()
                .AddAbpUserStore<UserStore>()
                .AddAbpRoleStore<RoleStore>()
                .AddAbpLogInManager<LogInManager>()
                .AddAbpSignInManager<SignInManager>()
                .AddAbpSecurityStampValidator<SecurityStampValidator>()
                .AddAbpUserClaimsPrincipalFactory<UserClaimsPrincipalFactory>()
                .AddPermissionChecker<ShaPermissionChecker>()
                .AddDefaultTokenProviders();
        }
    }
}
