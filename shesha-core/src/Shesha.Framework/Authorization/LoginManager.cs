using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Configuration.Security;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.MultiTenancy;
using System;
using System.Linq;

namespace Shesha.Authorization
{
    public class LogInManager : ShaLoginManager<Tenant, Role, User>
    {
        private readonly IConfigurationFrameworkRuntime _cfRuntime;

        public LogInManager(
            AbpUserManager<Role, User> userManager, 
            IMultiTenancyConfig multiTenancyConfig, 
            IRepository<Tenant> tenantRepository, 
            IUnitOfWorkManager unitOfWorkManager, 
            IUserManagementConfig userManagementConfig, 
            IIocResolver iocResolver, 
            IPasswordHasher<User> passwordHasher, 
            AbpRoleManager<Role, User> roleManager, 
            AbpUserClaimsPrincipalFactory<User, Role> claimsPrincipalFactory, 
            IRepository<ShaUserLoginAttempt, Guid> shaLoginAttemptRepository, 
            IRepository<MobileDevice, Guid> mobileDeviceRepository,
            ISecuritySettings securitySettings,
            IConfigurationFrameworkRuntime cfRuntime
            ) : base(
                userManager, 
                multiTenancyConfig, 
                tenantRepository, 
                unitOfWorkManager, 
                userManagementConfig, 
                iocResolver, 
                passwordHasher, 
                roleManager, 
                claimsPrincipalFactory, 
                shaLoginAttemptRepository, 
                mobileDeviceRepository,
                securitySettings
            )
        {
            _cfRuntime = cfRuntime;
        }

        protected override ShaLoginResult<User>? AdditionalVerification(User user, Tenant? tenant)
        {
            if (user.AllowedFrontEndApps != null
                && user.AllowedFrontEndApps.Any()
                && (string.IsNullOrWhiteSpace(_cfRuntime.FrontEndApplication) || !user.AllowedFrontEndApps.Contains(_cfRuntime.FrontEndApplication))
                )
                return new ShaLoginResult<User>(ShaLoginResultType.ForbiddenFrontend, tenant, user);
            return null;
        }
    }
}
