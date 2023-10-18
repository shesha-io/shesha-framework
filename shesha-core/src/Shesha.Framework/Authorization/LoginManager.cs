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
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.MultiTenancy;
using System;

namespace Shesha.Authorization
{
    public class LogInManager : ShaLoginManager<Tenant, Role, User>
    {
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
            IAuthenticationSettings authSettings) : base(
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
                authSettings
            )
        {
        }
    }
}
