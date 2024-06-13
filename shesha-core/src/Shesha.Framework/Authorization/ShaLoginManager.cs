using Abp;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.IdentityFramework;
using Abp.MultiTenancy;
using Abp.UI;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using NetTopologySuite.Operation.Valid;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.MultiTenancy;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Transactions;

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
        protected IUserManagementConfig UserManagementConfig { get; }
        protected IIocResolver IocResolver { get; }
        protected AbpRoleManager<TRole, TUser> RoleManager { get; }
        public IOtpManager OtpManager { get; set; }
        private readonly IAuthenticationSettings _authSettings;

        private readonly IPasswordHasher<TUser> _passwordHasher;

        private readonly AbpUserClaimsPrincipalFactory<TUser, TRole> _claimsPrincipalFactory;

        protected readonly IRepository<ShaUserLoginAttempt, Guid> ShaLoginAttemptRepository;
        private readonly IRepository<MobileDevice, Guid> _mobileDeviceRepository;

        public ShaLoginManager(
            AbpUserManager<TRole, TUser> userManager,
            IMultiTenancyConfig multiTenancyConfig,
            IRepository<TTenant> tenantRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IUserManagementConfig userManagementConfig,
            IIocResolver iocResolver,
            IPasswordHasher<TUser> passwordHasher,
            AbpRoleManager<TRole, TUser> roleManager,
            AbpUserClaimsPrincipalFactory<TUser, TRole> claimsPrincipalFactory,
            IRepository<ShaUserLoginAttempt, Guid> shaLoginAttemptRepository,
            IRepository<MobileDevice, Guid> mobileDeviceRepository,
            IAuthenticationSettings authSettings)
        {
            _passwordHasher = passwordHasher;
            _claimsPrincipalFactory = claimsPrincipalFactory;
            MultiTenancyConfig = multiTenancyConfig;
            TenantRepository = tenantRepository;
            UnitOfWorkManager = unitOfWorkManager;
            UserManagementConfig = userManagementConfig;
            IocResolver = iocResolver;
            RoleManager = roleManager;
            UserManager = userManager;
            _authSettings = authSettings;

            ClientInfoProvider = NullClientInfoProvider.Instance;
            ShaLoginAttemptRepository = shaLoginAttemptRepository;
            _mobileDeviceRepository = mobileDeviceRepository;
        }

        public virtual async Task<ShaLoginResult<TUser>> LoginAsync(UserLoginInfo login, string imei = null, string tenancyName = null)
        {
            ShaLoginResult<TUser> result = null;
            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                result = await LoginAsyncInternal(login, tenancyName);
                await uow.CompleteAsync();
            }

            await SaveLoginAttemptAsync(result, imei, tenancyName, login.ProviderKey + "@" + login.LoginProvider);

            return result;
        }

        protected virtual async Task<ShaLoginResult<TUser>> LoginAsyncInternal(UserLoginInfo login, string tenancyName)
        {
            if (login == null || login.LoginProvider.IsNullOrEmpty() || login.ProviderKey.IsNullOrEmpty())
            {
                throw new ArgumentException("login");
            }

            return await ProcessTenancyLoginActionAsync(null, tenancyName, true, async (tenant) => {
                var user = await UserManager.FindAsync(tenant?.Id, login);
                if (user == null)
                {
                    return new ShaLoginResult<TUser>(ShaLoginResultType.UnknownExternalLogin, tenant);
                }

                return await CreateLoginResultAsync(user, tenant);
            });
        }

        public virtual async Task<ShaLoginResult<TUser>> AnonymousLoginViaDeviceIdAsync(Guid deviceId, string imei = null, string tenancyName = null)
        {
            ShaLoginResult<TUser> result = null;
            var user = await UserManager.FindByNameAsync(deviceId.ToString());
            if (user == null)
                throw new UserFriendlyException("User with the specified deviceId not found");

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                result = await ProcessTenancyLoginActionAsync(imei, tenancyName, false, async (tenant) => {
                    return await CreateLoginResultAsync(user, tenant);
                });
            }
            await SaveLoginAttemptAsync(result, imei, tenancyName, deviceId.ToString());

            return result;
        }

        private void CheckOtpAuthAvailability() 
        {
            if (OtpManager == null)
                throw new NotSupportedException("OTP authentication is not supported");
        }

        public virtual async Task<ISendPinResponse> SendLoginOtpAsync(TUser user, string mobileNumber)
        {
            CheckOtpAuthAvailability();

            var lifetime = await _authSettings.MobileLoginPinLifetime.GetValueAsync();

            var response = await OtpManager.SendPinAsync(new SendPinInput()
            {
                SendTo = mobileNumber,
                SendType = OtpSendType.Sms,
                Lifetime = lifetime,
                ActionType = "OTP login",
                RecipientId = user.Id.ToString(),
            });

            // save operation Id to 
            user.PasswordResetCode = response.OperationId.ToString();
            await UserManager.UpdateAsync(user);

            return response;
        }

        public virtual async Task<ShaLoginResult<TUser>> LoginViaOtpAsync(string mobileNo, Guid operationId, string code, string imei = null, string tenancyName = null, bool shouldLockout = true)
        {
            CheckOtpAuthAvailability();
            
            ShaLoginResult<TUser> result = null;

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew)) 
            {
                result = await ProcessTenancyLoginActionAsync(imei, tenancyName, shouldLockout, async (tenant) => {

                    var otp = await OtpManager.GetAsync(operationId);
                    if (otp == null)
                        return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidOTP, tenant);
                    var verificationResult = await OtpManager.VerifyPinAsync(new VerifyPinInput
                    {
                        OperationId = operationId,
                        Pin = code
                    });

                    var user = !string.IsNullOrWhiteSpace(otp.RecipientId)
                            ? await UserManager.FindByIdAsync(otp.RecipientId)
                            : null;

                    if (user == null)
                        return new ShaLoginResult<TUser>(ShaLoginResultType.UserNotFound, tenant);

                    if (await UserManager.IsLockedOutAsync(user))
                        return new ShaLoginResult<TUser>(ShaLoginResultType.LockedOut, tenant, user);

                    if (!verificationResult.IsSuccess || user.PasswordResetCode != otp.OperationId.ToString())
                    {
                        if (shouldLockout)
                        {
                            if (await TryLockOutAsync(tenant?.Id, user.Id))
                                return new ShaLoginResult<TUser>(ShaLoginResultType.LockedOut, tenant, user);
                        }

                        return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidOTP, tenant, user);
                    }

                    // authenticated using internal account, check IMEI
                    if (!(await CheckImeiAsync(imei)))
                        return new ShaLoginResult<TUser>(ShaLoginResultType.DeviceNotRegistered, tenant, user);

                    // clear reset code
                    user.PasswordResetCode = null;
                    await UserManager.UpdateAsync(user);

                    return await CreateLoginResultAsync(user, tenant);
                });

            }

            await SaveLoginAttemptAsync(result, imei, tenancyName, mobileNo);

            return result;
        }

        public virtual async Task<ShaLoginResult<TUser>> LoginAsync(string userNameOrEmailAddress, string plainPassword, string imei = null, string tenancyName = null, bool shouldLockout = true)
        {
            ShaLoginResult<TUser> result = null;
            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                result = await LoginAsyncInternal(userNameOrEmailAddress, plainPassword, imei, tenancyName, shouldLockout);
                await uow.CompleteAsync();
            }
            
            await SaveLoginAttemptAsync(result, imei, tenancyName, userNameOrEmailAddress);
            return result;
        }

        private async Task<ShaLoginResult<TUser>> ProcessTenancyLoginActionAsync(string imei, string tenancyName, bool shouldLockout, Func<TTenant, Task<ShaLoginResult<TUser>>> action) 
        {
            // Get and check tenant
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
                        return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidTenancyName);
                    }

                    if (!tenant.IsActive)
                    {
                        return new ShaLoginResult<TUser>(ShaLoginResultType.TenantIsNotActive, tenant);
                    }
                }
            }

            var tenantId = tenant?.Id;
            using (UnitOfWorkManager.Current.SetTenantId(tenantId))
            {
                await UserManager.InitializeOptionsAsync(tenantId);

                return await action.Invoke(tenant);
            }
        }

        protected virtual async Task<ShaLoginResult<TUser>> LoginAsyncInternal(string userNameOrEmailAddress, string plainPassword, string imei, string tenancyName, bool shouldLockout)
        {
            if (userNameOrEmailAddress.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(userNameOrEmailAddress));
            }

            if (plainPassword.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(plainPassword));
            }

            return await ProcessTenancyLoginActionAsync(imei, tenancyName, shouldLockout, async (tenant) => {
                //TryLoginFromExternalAuthenticationSources method may create the user, that's why we are calling it before AbpUserStore.FindByNameOrEmailAsync
                var loggedInFromExternalSource = await TryLoginFromExternalAuthenticationSourcesAsync(userNameOrEmailAddress, plainPassword, tenant);

                var user = await UserManager.FindByNameOrEmailAsync(tenant?.Id, userNameOrEmailAddress);
                if (user == null)
                {
                    return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidUserNameOrEmailAddress, tenant);
                }
                else if (IocResolver.IsRegistered<IEmailLoginFilter<TUser>>() && userNameOrEmailAddress.IsEmail())
                {
                    var filter = IocResolver.Resolve<IEmailLoginFilter<TUser>>();
                    if (!filter.AllowToLoginUsingEmail(userNameOrEmailAddress, user))
                        return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidUserName, tenant, user);
                }

                if (await UserManager.IsLockedOutAsync(user))
                {
                    return new ShaLoginResult<TUser>(ShaLoginResultType.LockedOut, tenant, user);
                }

                if (!loggedInFromExternalSource)
                {
                    if (!await UserManager.CheckPasswordAsync(user, plainPassword))
                    {
                        if (shouldLockout)
                        {
                            if (await TryLockOutAsync(tenant?.Id, user.Id))
                            {
                                return new ShaLoginResult<TUser>(ShaLoginResultType.LockedOut, tenant, user);
                            }
                        }

                        return new ShaLoginResult<TUser>(ShaLoginResultType.InvalidPassword, tenant, user);
                    }

                    // authenticated using internal account, check IMEI
                    if (!(await CheckImeiAsync(imei)))
                        return new ShaLoginResult<TUser>(ShaLoginResultType.DeviceNotRegistered, tenant, user);

                    await UserManager.ResetAccessFailedCountAsync(user);
                }
                else
                {
                    // authenticated using external source, check IMEI
                    if (!(await CheckImeiAsync(imei)))
                        return new ShaLoginResult<TUser>(ShaLoginResultType.DeviceNotRegistered, tenant, user);
                }
                return await CreateLoginResultAsync(user, tenant);
            });
        }

        private async Task<bool> CheckImeiAsync(string imei)
        {
            if (string.IsNullOrWhiteSpace(imei))
                return true; // skip if the IMEI is null

            return await _mobileDeviceRepository.GetAll().Where(d => d.IMEI == imei.Trim() && !d.IsLocked).AnyAsync();
        }

        protected virtual async Task<ShaLoginResult<TUser>> CreateLoginResultAsync(TUser user, TTenant tenant = null)
        {
            if (!user.IsActive)
            {
                return new ShaLoginResult<TUser>(ShaLoginResultType.UserIsNotActive);
            }

            var principal = await _claimsPrincipalFactory.CreateAsync(user);

            return new ShaLoginResult<TUser>(
                tenant,
                user,
                principal.Identity as ClaimsIdentity
            );
        }

        public virtual async Task SaveLoginAttemptAsync(ShaLoginResult<TUser> loginResult, string imei,
            string tenancyName, string userNameOrEmailAddress)
        {
            if (UnitOfWorkManager.Current != null)
                await UnitOfWorkManager.Current.SaveChangesAsync();

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.Suppress))
            {
                var tenantId = loginResult.TenantId;
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
                : (await _mobileDeviceRepository.GetAll().Where(d => d.IMEI == imei).FirstOrDefaultAsync())?.Name;
        }

        protected virtual void SaveLoginAttempt(ShaLoginResult<TUser> loginResult, string tenancyName, string userNameOrEmailAddress)
        {
            UnitOfWorkManager.Current?.SaveChanges();

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.Suppress))
            {
                var tenantId = loginResult.TenantId;
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
    }
}
