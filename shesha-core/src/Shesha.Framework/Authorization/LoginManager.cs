using System;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Configuration;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.MultiTenancy;

namespace Shesha.Authorization
{
    public class LogInManager : ShaLoginManager<Tenant, Role, User>
    {
        public LogInManager(AbpUserManager<Role, User> userManager, IMultiTenancyConfig multiTenancyConfig, IRepository<Tenant> tenantRepository, IUnitOfWorkManager unitOfWorkManager, ISettingManager settingManager, IUserManagementConfig userManagementConfig, IIocResolver iocResolver, IPasswordHasher<User> passwordHasher, AbpRoleManager<Role, User> roleManager, AbpUserClaimsPrincipalFactory<User, Role> claimsPrincipalFactory, IRepository<ShaUserLoginAttempt, Guid> shaLoginAttemptRepository, IRepository<MobileDevice, Guid> mobileDeviceRepository) : base(userManager, multiTenancyConfig, tenantRepository, unitOfWorkManager, settingManager, userManagementConfig, iocResolver, passwordHasher, roleManager, claimsPrincipalFactory, shaLoginAttemptRepository, mobileDeviceRepository)
        {
        }
    }
}
