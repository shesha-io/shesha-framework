using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Transactions;
using Abp;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Configuration;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.IdentityFramework;
using Abp.MultiTenancy;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.Utilities;

namespace Shesha.Authorization
{
    public class ShaLoginManager<TTenant, TRole, TUser> : ITransientDependency
        where TTenant : AbpTenant<TUser>
        where TRole : AbpRole<TUser>, new()
        where TUser : AbpUser<TUser>
    {
        public IClientInfoProvider ClientInfoProvider { get; set; }

        protected IMultiTenancyConfig MultiTenancyConfig { get; }
        protected IRepository<TTenant> TenantRepository { get; }
        protected IUnitOfWorkManager UnitOfWorkManager { get; }
        protected AbpUserManager<TRole, TUser> UserManager { get; }
        protected ISettingManager SettingManager { get; }
        protected IUserManagementConfig UserManagementConfig { get; }
        protected IIocResolver IocResolver { get; }
        protected AbpRoleManager<TRole, TUser> RoleManager { get; }

        private readonly IPasswordHasher<TUser> _passwordHasher;

        private readonly AbpUserClaimsPrincipalFactory<TUser, TRole> _claimsPrincipalFactory;

        protected readonly IRepository<ShaUserLoginAttempt, Guid> ShaLoginAttemptRepository;
        private readonly IRepository<MobileDevice, Guid> _mobileDeviceRepository;

        public ShaLoginManager(
            AbpUserManager<TRole, TUser> userManager,
            IMultiTenancyConfig multiTenancyConfig,
            IRepository<TTenant> tenantRepository,
            IUnitOfWorkManager unitOfWorkManager,
            ISettingManager settingManager,
            IUserManagementConfig userManagementConfig,
            IIocResolver iocResolver,
            IPasswordHasher<TUser> passwordHasher,
            AbpRoleManager<TRole, TUser> roleManager,
            AbpUserClaimsPrincipalFactory<TUser, TRole> claimsPrincipalFactory,
            IRepository<ShaUserLoginAttempt, Guid> shaLoginAttemptRepository,
            IRepository<MobileDevice, Guid> mobileDeviceRepository)
        {
            _passwordHasher = passwordHasher;
            _claimsPrincipalFactory = claimsPrincipalFactory;
            MultiTenancyConfig = multiTenancyConfig;
            TenantRepository = tenantRepository;
            UnitOfWorkManager = unitOfWorkManager;
            SettingManager = settingManager;
            UserManagementConfig = userManagementConfig;
            IocResolver = iocResolver;
            RoleManager = roleManager;
            UserManager = userManager;

            ClientInfoProvider = NullClientInfoProvider.Instance;
            ShaLoginAttemptRepository = shaLoginAttemptRepository;
            _mobileDeviceRepository = mobileDeviceRepository;
        }

        public virtual async Task<ShaLoginResult<TTenant, TUser>> LoginAsync(UserLoginInfo login, string imei = null, string tenancyName = null)
        {
            ShaLoginResult<TTenant, TUser> result = null;
            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                result = await LoginAsyncInternal(login, tenancyName);
                await uow.CompleteAsync();
            }

            await SaveLoginAttemptAsync(result, imei, tenancyName, login.ProviderKey + "@" + login.LoginProvider);

            return result;
        }

        protected virtual async Task<ShaLoginResult<TTenant, TUser>> LoginAsyncInternal(UserLoginInfo login, string tenancyName)
        {
            if (login == null || login.LoginProvider.IsNullOrEmpty() || login.ProviderKey.IsNullOrEmpty())
            {
                throw new ArgumentException("login");
            }

            //Get and check tenant
            TTenant tenant = null;
            if (!MultiTenancyConfig.IsEnabled)
            {
                tenant = await GetDefaultTenantAsync();
            }
            else if (!string.IsNullOrWhiteSpace(tenancyName))
            {
                tenant = await TenantRepository.FirstOrDefaultAsync(t => t.TenancyName == tenancyName);
                if (tenant == null)
                {
                    return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.InvalidTenancyName);
                }

                if (!tenant.IsActive)
                {
                    return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.TenantIsNotActive, tenant);
                }
            }

            int? tenantId = tenant == null ? (int?)null : tenant.Id;
            using (UnitOfWorkManager.Current.SetTenantId(tenantId))
            {
                var user = await UserManager.FindAsync(tenantId, login);
                if (user == null)
                {
                    return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.UnknownExternalLogin, tenant);
                }

                return await CreateLoginResultAsync(user, tenant);
            }
        }

        public virtual async Task<ShaLoginResult<TTenant, TUser>> LoginAsync(string userNameOrEmailAddress, string plainPassword, string imei = null, string tenancyName = null, bool shouldLockout = true)
        {
            ShaLoginResult<TTenant, TUser> result = null;
            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                result = await LoginAsyncInternal(userNameOrEmailAddress, plainPassword, imei, tenancyName, shouldLockout);
                await uow.CompleteAsync();
            }
            
            await SaveLoginAttemptAsync(result, imei, tenancyName, userNameOrEmailAddress);
            return result;
        }

        protected virtual async Task<ShaLoginResult<TTenant, TUser>> LoginAsyncInternal(string userNameOrEmailAddress, string plainPassword, string imei, string tenancyName, bool shouldLockout)
        {
            if (userNameOrEmailAddress.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(userNameOrEmailAddress));
            }

            if (plainPassword.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(plainPassword));
            }

            //Get and check tenant
            TTenant tenant = null;
            using (UnitOfWorkManager.Current.SetTenantId(null))
            {
                if (!MultiTenancyConfig.IsEnabled)
                {
                    tenant = await GetDefaultTenantAsync();
                }
                else if (!string.IsNullOrWhiteSpace(tenancyName))
                {
                    tenant = await TenantRepository.FirstOrDefaultAsync(t => t.TenancyName == tenancyName);
                    if (tenant == null)
                    {
                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.InvalidTenancyName);
                    }

                    if (!tenant.IsActive)
                    {
                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.TenantIsNotActive, tenant);
                    }
                }
            }

            var tenantId = tenant?.Id;
            using (UnitOfWorkManager.Current.SetTenantId(tenantId))
            {
                await UserManager.InitializeOptionsAsync(tenantId);

                //TryLoginFromExternalAuthenticationSources method may create the user, that's why we are calling it before AbpUserStore.FindByNameOrEmailAsync
                var loggedInFromExternalSource = await TryLoginFromExternalAuthenticationSourcesAsync(userNameOrEmailAddress, plainPassword, tenant);

                var user = await UserManager.FindByNameOrEmailAsync(tenantId, userNameOrEmailAddress);
                if (user == null)
                {
                    return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.InvalidUserNameOrEmailAddress, tenant);
                } else if (IocResolver.IsRegistered<IEmailLoginFilter<TUser>>() && userNameOrEmailAddress.IsEmail())
                {
                    var filter = IocResolver.Resolve<IEmailLoginFilter<TUser>>();
                    if (!filter.AllowToLoginUsingEmail(userNameOrEmailAddress, user))
                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.InvalidUserName, tenant, user);
                }

                if (await UserManager.IsLockedOutAsync(user))
                {
                    return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.LockedOut, tenant, user);
                }

                if (!loggedInFromExternalSource)
                {
                    if (!await UserManager.CheckPasswordAsync(user, plainPassword))
                    {
                        if (shouldLockout)
                        {
                            if (await TryLockOutAsync(tenantId, user.Id))
                            {
                                return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.LockedOut, tenant, user);
                            }
                        }

                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.InvalidPassword, tenant, user);
                    }

                    // authenticated using internal account, check IMEI
                    if (!(await CheckImeiAsync(imei)))
                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.DeviceNotRegistered, tenant, user);

                    await UserManager.ResetAccessFailedCountAsync(user);
                }
                else
                {
                    // authenticated using external source, check IMEI
                    if (!(await CheckImeiAsync(imei)))
                        return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.DeviceNotRegistered, tenant, user);
                }

                return await CreateLoginResultAsync(user, tenant);
            }
        }

        private async Task<bool> CheckImeiAsync(string imei)
        {
            if (string.IsNullOrWhiteSpace(imei))
                return true; // skip if the IMEI is null

            return await _mobileDeviceRepository.GetAll().AnyAsync(d => d.IMEI == imei.Trim() && !d.IsLocked);
        }

        protected virtual async Task<ShaLoginResult<TTenant, TUser>> CreateLoginResultAsync(TUser user, TTenant tenant = null)
        {
            if (!user.IsActive)
            {
                return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.UserIsNotActive);
            }

            if (await IsEmailConfirmationRequiredForLoginAsync(user.TenantId) && !user.IsEmailConfirmed)
            {
                return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.UserEmailIsNotConfirmed);
            }

            if (await IsPhoneConfirmationRequiredForLoginAsync(user.TenantId) && !user.IsPhoneNumberConfirmed)
            {
                return new ShaLoginResult<TTenant, TUser>(ShaLoginResultType.UserPhoneNumberIsNotConfirmed);
            }

            var principal = await _claimsPrincipalFactory.CreateAsync(user);

            return new ShaLoginResult<TTenant, TUser>(
                tenant,
                user,
                principal.Identity as ClaimsIdentity
            );
        }

        public virtual async Task SaveLoginAttemptAsync(ShaLoginResult<TTenant, TUser> loginResult, string imei,
            string tenancyName, string userNameOrEmailAddress)
        {
            if (UnitOfWorkManager.Current != null)
                await UnitOfWorkManager.Current.SaveChangesAsync();

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.Suppress))
            {
                var tenantId = loginResult.Tenant?.Id;
                using (UnitOfWorkManager.Current.SetTenantId(tenantId))
                {
                    var loginAttempt = new ShaUserLoginAttempt
                    {
                        TenantId = tenantId,
                        TenancyName = tenancyName,

                        UserId = loginResult.User?.Id,
                        UserNameOrEmailAddress = userNameOrEmailAddress,

                        Result = loginResult.Result,

                        BrowserInfo = ClientInfoProvider.BrowserInfo,
                        ClientIpAddress = ClientInfoProvider.ClientIpAddress,
                        ClientName = ClientInfoProvider.ComputerName,
                        IMEI = imei,
                        DeviceName = await GetDeviceNameAsync(imei),
                        LoginAttemptNumber = loginResult.Result == ShaLoginResultType.InvalidPassword
                            ? loginResult.User?.AccessFailedCount + 1
                            : null
                    };

                    await ShaLoginAttemptRepository.InsertAsync(loginAttempt);
                    
                    await uow.CompleteAsync();
                }
            }
        }

        private async Task<string> GetDeviceNameAsync(string imei)
        {
            return string.IsNullOrWhiteSpace(imei)
                ? null
                : (await _mobileDeviceRepository.GetAll().FirstOrDefaultAsync(d => d.IMEI == imei))?.Name;
        }

        protected virtual void SaveLoginAttempt(ShaLoginResult<TTenant, TUser> loginResult, string tenancyName, string userNameOrEmailAddress)
        {
            UnitOfWorkManager.Current?.SaveChanges();

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.Suppress))
            {
                var tenantId = loginResult.Tenant?.Id;
                using (UnitOfWorkManager.Current.SetTenantId(tenantId))
                {
                    var loginAttempt = new ShaUserLoginAttempt
                    {
                        TenantId = tenantId,
                        TenancyName = tenancyName,

                        UserId = loginResult.User?.Id,
                        UserNameOrEmailAddress = userNameOrEmailAddress,

                        Result = loginResult.Result,

                        BrowserInfo = ClientInfoProvider.BrowserInfo,
                        ClientIpAddress = ClientInfoProvider.ClientIpAddress,
                        ClientName = ClientInfoProvider.ComputerName,
                    };

                    ShaLoginAttemptRepository.Insert(loginAttempt);

                    uow.Complete();
                }
            }
        }

        protected virtual async Task<bool> TryLockOutAsync(int? tenantId, long userId)
        {
            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                using (UnitOfWorkManager.Current.SetTenantId(tenantId))
                {
                    var user = await UserManager.FindByIdAsync(userId.ToString());

                    (await UserManager.AccessFailedAsync(user)).CheckErrors();

                    var isLockOut = await UserManager.IsLockedOutAsync(user);

                    await UnitOfWorkManager.Current.SaveChangesAsync();

                    await uow.CompleteAsync();

                    return isLockOut;
                }
            }
        }

        protected virtual async Task<bool> TryLoginFromExternalAuthenticationSourcesAsync(string userNameOrEmailAddress, string plainPassword, TTenant tenant)
        {
            if (!UserManagementConfig.ExternalAuthenticationSources.Any())
            {
                return false;
            }

            foreach (var sourceType in UserManagementConfig.ExternalAuthenticationSources)
            {
                using (var source = IocResolver.ResolveAsDisposable<IExternalAuthenticationSource<TTenant, TUser>>(sourceType))
                {
                    if (await source.Object.TryAuthenticateAsync(userNameOrEmailAddress, plainPassword, tenant))
                    {
                        var tenantId = tenant == null ? (int?)null : tenant.Id;
                        using (UnitOfWorkManager.Current.SetTenantId(tenantId))
                        {
                            var user = await UserManager.FindByNameOrEmailAsync(tenantId, userNameOrEmailAddress);
                            if (user == null)
                            {
                                user = await source.Object.CreateUserAsync(userNameOrEmailAddress, tenant);

                                user.TenantId = tenantId;
                                user.AuthenticationSource = source.Object.Name;
                                user.Password = _passwordHasher.HashPassword(user, StringExtensions.Left(Guid.NewGuid().ToString("N"), 16)); //Setting a random password since it will not be used
                                user.SetNormalizedNames();

                                if (user.Roles == null)
                                {
                                    user.Roles = new List<UserRole>();
                                    foreach (var defaultRole in RoleManager.Roles.Where(r => r.TenantId == tenantId && r.IsDefault).ToList())
                                    {
                                        user.Roles.Add(new UserRole(tenantId, user.Id, defaultRole.Id));
                                    }
                                }

                                await UserManager.CreateAsync(user);
                            }
                            else
                            {
                                await source.Object.UpdateUserAsync(user, tenant);

                                user.AuthenticationSource = source.Object.Name;

                                await UserManager.UpdateAsync(user);
                            }

                            await UnitOfWorkManager.Current.SaveChangesAsync();

                            return true;
                        }
                    }
                }
            }

            return false;
        }


        protected virtual async Task<TTenant> GetDefaultTenantAsync()
        {
            var tenant = await TenantRepository.FirstOrDefaultAsync(t => t.TenancyName == AbpTenant<TUser>.DefaultTenantName);
            if (tenant == null)
            {
                throw new AbpException("There should be a 'Default' tenant if multi-tenancy is disabled!");
            }

            return tenant;
        }

        protected virtual TTenant GetDefaultTenant()
        {
            var tenant = TenantRepository.FirstOrDefault(t => t.TenancyName == AbpTenant<TUser>.DefaultTenantName);
            if (tenant == null)
            {
                throw new AbpException("There should be a 'Default' tenant if multi-tenancy is disabled!");
            }

            return tenant;
        }

        protected virtual async Task<bool> IsEmailConfirmationRequiredForLoginAsync(int? tenantId)
        {
            if (tenantId.HasValue)
            {
                return await SettingManager.GetSettingValueForTenantAsync<bool>(AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin, tenantId.Value);
            }

            return await SettingManager.GetSettingValueForApplicationAsync<bool>(AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin);
        }

        protected virtual bool IsEmailConfirmationRequiredForLogin(int? tenantId)
        {
            if (tenantId.HasValue)
            {
                return SettingManager.GetSettingValueForTenant<bool>(AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin, tenantId.Value);
            }

            return SettingManager.GetSettingValueForApplication<bool>(AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin);
        }

        protected virtual Task<bool> IsPhoneConfirmationRequiredForLoginAsync(int? tenantId)
        {
            return Task.FromResult(false);
        }

        protected virtual bool IsPhoneConfirmationRequiredForLogin(int? tenantId)
        {
            return false;
        }
    }
}
