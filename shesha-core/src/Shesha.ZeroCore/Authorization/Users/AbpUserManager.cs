using Abp.Application.Features;
using Abp.Authorization.Roles;
using Abp.Configuration;
using Abp.Configuration.Startup;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Domain.Uow;
using Abp.Localization;
using Abp.MultiTenancy;
using Abp.Runtime.Caching;
using Abp.Runtime.Session;
using Abp.UI;
using Abp.Zero;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Abp.Authorization.Users;

public class AbpUserManager<TRole, TUser> : UserManager<TUser>, IAbpUserManager<TRole, TUser>, IDomainService
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    protected IUserPermissionStore<TUser> UserPermissionStore
    {
        get
        {
            if (Store is not IUserPermissionStore<TUser> store)
                throw new AbpException("Store is not IUserPermissionStore");

            return store;
        }
    }

    public ILocalizationManager LocalizationManager { get; set; }

    protected string LocalizationSourceName { get; set; }

    public IAbpSession AbpSession { get; set; }

    public FeatureDependencyContext FeatureDependencyContext { get; set; }

    protected AbpRoleManager<TRole, TUser> RoleManager { get; }

    protected AbpUserStore<TRole, TUser> AbpUserStore { get; }

    public IMultiTenancyConfig MultiTenancy { get; set; }

    private readonly IPermissionManager _permissionManager;
    private readonly IUnitOfWorkManager _unitOfWorkManager;
    private readonly ICacheManager _cacheManager;
    private readonly ISettingManager _settingManager;
    private readonly IOptions<IdentityOptions> _optionsAccessor;
    private readonly IRepository<UserLogin, long> _userLoginRepository;

    public AbpUserManager(
        AbpRoleManager<TRole, TUser> roleManager,
        AbpUserStore<TRole, TUser> userStore,
        IOptions<IdentityOptions> optionsAccessor,
        IPasswordHasher<TUser> passwordHasher,
        IEnumerable<IUserValidator<TUser>> userValidators,
        IEnumerable<IPasswordValidator<TUser>> passwordValidators,
        ILookupNormalizer keyNormalizer,
        IdentityErrorDescriber errors,
        IServiceProvider services,
        ILogger<UserManager<TUser>> logger,
        IPermissionManager permissionManager,
        IUnitOfWorkManager unitOfWorkManager,
        ICacheManager cacheManager,
        ISettingManager settingManager,
        IRepository<UserLogin, long> userLoginRepository)
        : base(
            userStore,
            optionsAccessor,
            passwordHasher,
            userValidators,
            passwordValidators,
            keyNormalizer,
            errors,
            services,
            logger)
    {
        _permissionManager = permissionManager;
        _unitOfWorkManager = unitOfWorkManager;
        _cacheManager = cacheManager;
        _settingManager = settingManager;
        _userLoginRepository = userLoginRepository;
        _optionsAccessor = optionsAccessor;

        AbpUserStore = userStore;
        RoleManager = roleManager;
        LocalizationManager = NullLocalizationManager.Instance;
        LocalizationSourceName = AbpZeroConsts.LocalizationSourceName;
    }

    public virtual Task<IQueryable<TUser>> GetUsersAsync()
        => AbpUserStore.GetUsersAsync();

    public override async Task<IdentityResult> CreateAsync(TUser user)
    {
        var result = await CheckDuplicateUsernameOrEmailAddressAsync(user.Id, user.UserName, user.EmailAddress);
        if (!result.Succeeded)
        {
            return result;
        }

        var tenantId = GetCurrentTenantId();
        if (tenantId.HasValue && !user.TenantId.HasValue)
        {
            user.TenantId = tenantId.Value;
        }

        await InitializeOptionsAsync(user.TenantId);

        return await base.CreateAsync(user);
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="permissionName">Permission name</param>
    public virtual async Task<bool> IsGrantedAsync(long userId, string permissionName)
    {
        return await IsGrantedAsync(
            userId,
            _permissionManager.GetPermission(permissionName)
        );
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="permissionName">Permission name</param>
    public virtual bool IsGranted(long userId, string permissionName)
    {
        return IsGranted(
            userId,
            _permissionManager.GetPermission(permissionName)
        );
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="user">User</param>
    /// <param name="permission">Permission</param>
    public virtual Task<bool> IsGrantedAsync(TUser user, Permission permission)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        return IsGrantedAsync(user.Id, permission);
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="user">User</param>
    /// <param name="permission">Permission</param>
    public virtual bool IsGranted(TUser user, Permission permission)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        return IsGranted(user.Id, permission);
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="permission">Permission</param>
    public virtual async Task<bool> IsGrantedAsync(long userId, Permission permission)
    {
        //Check for multi-tenancy side
        if (!permission.MultiTenancySides.HasFlag(GetCurrentMultiTenancySide()))
        {
            return false;
        }

        //Check for depended features
        if (permission.FeatureDependency != null && GetCurrentMultiTenancySide() == MultiTenancySides.Tenant)
        {
            FeatureDependencyContext.TenantId = GetCurrentTenantId();

            if (!await permission.FeatureDependency.IsSatisfiedAsync(FeatureDependencyContext))
            {
                return false;
            }
        }

        //Get cached user permissions
        var cacheItem = await GetUserPermissionCacheItemAsync(userId);
        if (cacheItem == null)
        {
            return false;
        }

        //Check for user-specific value
        if (cacheItem.GrantedPermissions.Contains(permission.Name))
        {
            return true;
        }

        if (cacheItem.ProhibitedPermissions.Contains(permission.Name))
        {
            return false;
        }

        //Check for roles
        foreach (var roleId in cacheItem.RoleIds)
        {
            if (await RoleManager.IsGrantedAsync(roleId, permission))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Check whether a user is granted for a permission.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="permission">Permission</param>
    public virtual bool IsGranted(long userId, Permission permission)
    {
        //Check for multi-tenancy side
        if (!permission.MultiTenancySides.HasFlag(GetCurrentMultiTenancySide()))
        {
            return false;
        }

        //Check for depended features
        if (permission.FeatureDependency != null && GetCurrentMultiTenancySide() == MultiTenancySides.Tenant)
        {
            FeatureDependencyContext.TenantId = GetCurrentTenantId();

            if (!permission.FeatureDependency.IsSatisfied(FeatureDependencyContext))
            {
                return false;
            }
        }

        //Get cached user permissions
        var cacheItem = GetUserPermissionCacheItem(userId);
        if (cacheItem == null)
        {
            return false;
        }

        //Check for user-specific value
        if (cacheItem.GrantedPermissions.Contains(permission.Name))
        {
            return true;
        }

        if (cacheItem.ProhibitedPermissions.Contains(permission.Name))
        {
            return false;
        }

        //Check for roles
        foreach (var roleId in cacheItem.RoleIds)
        {
            if (RoleManager.IsGranted(roleId, permission))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Gets granted permissions for a user.
    /// </summary>
    /// <param name="user">Role</param>
    /// <returns>List of granted permissions</returns>
    public virtual async Task<IReadOnlyList<Permission>> GetGrantedPermissionsAsync(TUser user)
    {
        var permissionList = new List<Permission>();

        foreach (var permission in await _permissionManager.GetAllPermissionsAsync())
        {
            if (await IsGrantedAsync(user.Id, permission))
            {
                permissionList.Add(permission);
            }
        }

        return permissionList;
    }

    /// <summary>
    /// Sets all granted permissions of a user at once.
    /// Prohibits all other permissions.
    /// </summary>
    /// <param name="user">The user</param>
    /// <param name="permissions">Permissions</param>
    public virtual async Task SetGrantedPermissionsAsync(TUser user, IEnumerable<Permission> permissions)
    {
        var oldPermissions = await GetGrantedPermissionsAsync(user);
        var newPermissions = permissions.ToArray();

        foreach (var permission in oldPermissions.Where(p => !newPermissions.Contains(p)))
        {
            await ProhibitPermissionAsync(user, permission);
        }

        foreach (var permission in newPermissions.Where(p => !oldPermissions.Contains(p)))
        {
            await GrantPermissionAsync(user, permission);
        }
    }

    /// <summary>
    /// Prohibits all permissions for a user.
    /// </summary>
    /// <param name="user">User</param>
    public async Task ProhibitAllPermissionsAsync(TUser user)
    {
        foreach (var permission in _permissionManager.GetAllPermissions())
        {
            await ProhibitPermissionAsync(user, permission);
        }
    }

    /// <summary>
    /// Resets all permission settings for a user.
    /// It removes all permission settings for the user.
    /// User will have permissions according to his roles.
    /// This method does not prohibit all permissions.
    /// For that, use <see cref="ProhibitAllPermissionsAsync"/>.
    /// </summary>
    /// <param name="user">User</param>
    public async Task ResetAllPermissionsAsync(TUser user)
    {
        await UserPermissionStore.RemoveAllPermissionSettingsAsync(user);
    }

    /// <summary>
    /// Resets all permission settings for a user.
    /// It removes all permission settings for the user.
    /// User will have permissions according to his roles.
    /// This method does not prohibit all permissions.
    /// For that, use <see cref="ProhibitAllPermissionsAsync"/>.
    /// </summary>
    /// <param name="user">User</param>
    public void ResetAllPermissions(TUser user)
    {
        UserPermissionStore.RemoveAllPermissionSettings(user);
    }

    /// <summary>
    /// Grants a permission for a user if not already granted.
    /// </summary>
    /// <param name="user">User</param>
    /// <param name="permission">Permission</param>
    public virtual async Task GrantPermissionAsync(TUser user, Permission permission)
    {
        await UserPermissionStore.RemovePermissionAsync(user, new PermissionGrantInfo(permission.Name, false));

        if (await IsGrantedAsync(user.Id, permission))
        {
            return;
        }

        await UserPermissionStore.AddPermissionAsync(user, new PermissionGrantInfo(permission.Name, true));
    }

    /// <summary>
    /// Prohibits a permission for a user if it's granted.
    /// </summary>
    /// <param name="user">User</param>
    /// <param name="permission">Permission</param>
    public virtual async Task ProhibitPermissionAsync(TUser user, Permission permission)
    {
        await UserPermissionStore.RemovePermissionAsync(user, new PermissionGrantInfo(permission.Name, true));

        if (!await IsGrantedAsync(user.Id, permission))
        {
            return;
        }

        await UserPermissionStore.AddPermissionAsync(user, new PermissionGrantInfo(permission.Name, false));
    }

    public virtual Task<TUser?> FindByNameOrEmailAsync(string userNameOrEmailAddress)
    {
        return AbpUserStore.FindByNameOrEmailAsync(userNameOrEmailAddress);
    }

    public virtual TUser? FindByNameOrEmail(string userNameOrEmailAddress)
    {
        return AbpUserStore.FindByNameOrEmail(userNameOrEmailAddress);
    }

    public virtual Task<List<TUser>> FindAllAsync(UserLoginInfo login)
    {
        return AbpUserStore.FindAllAsync(login);
    }

    public virtual List<TUser> FindAll(UserLoginInfo login)
    {
        return AbpUserStore.FindAll(login);
    }

    public virtual Task<TUser?> FindAsync(int? tenantId, UserLoginInfo login)
    {
        return AbpUserStore.FindAsync(tenantId, login);
    }

    public virtual TUser? Find(int? tenantId, UserLoginInfo login)
    {
        return AbpUserStore.Find(tenantId, login);
    }

    public virtual Task<TUser?> FindByNameOrEmailAsync(int? tenantId, string userNameOrEmailAddress)
    {
        return AbpUserStore.FindByNameOrEmailAsync(tenantId, userNameOrEmailAddress);
    }

    public virtual TUser? FindByNameOrEmail(int? tenantId, string userNameOrEmailAddress)
    {
        return AbpUserStore.FindByNameOrEmail(tenantId, userNameOrEmailAddress);
    }

    /// <summary>
    /// Gets a user by given id.
    /// Throws exception if no user found with given id.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <returns>User</returns>
    /// <exception cref="AbpException">Throws exception if no user found with given id</exception>
    public virtual async Task<TUser> GetUserByIdAsync(long userId)
    {
        var user = await FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new AbpException("There is no user with id: " + userId);
        }

        return user;
    }

    /// <summary>
    /// Gets a user by given id.
    /// Throws exception if no user found with given id.
    /// </summary>
    /// <param name="userId">User id</param>
    /// <returns>User</returns>
    /// <exception cref="AbpException">Throws exception if no user found with given id</exception>
    public virtual TUser GetUserById(long userId)
    {
        var user = AbpUserStore.FindById(userId.ToString());
        if (user == null)
        {
            throw new AbpException("There is no user with id: " + userId);
        }

        return user;
    }

    // Microsoft.AspNetCore.Identity.UserManager doesn't have required sync version for method calls in this function
    //public virtual TUser GetUserById(long userId)
    //{
    //    var user = FindById(userId.ToString());
    //    if (user == null)
    //    {
    //        throw new AbpException("There is no user with id: " + userId);
    //    }

    //    return user;
    //}

    public override async Task<IdentityResult> UpdateAsync(TUser user)
    {
        var result = await CheckDuplicateUsernameOrEmailAddressAsync(user.Id, user.UserName, user.EmailAddress);
        if (!result.Succeeded)
        {
            return result;
        }

        //Admin user's username can not be changed!
        if (user.UserName != AbpUserBase.AdminUserName)
        {
            if ((await GetOldUserNameAsync(user.Id)) == AbpUserBase.AdminUserName)
            {
                throw new UserFriendlyException(
                    string.Format(L("CanNotRenameAdminUser"), AbpUserBase.AdminUserName));
            }
        }

        return await base.UpdateAsync(user);
    }

    // Microsoft.AspNetCore.Identity.UserManager doesn't have required sync version for method calls in this function
    //public override IdentityResult Update(TUser user)
    //{
    //    var result = CheckDuplicateUsernameOrEmailAddress(user.Id, user.UserName, user.EmailAddress);
    //    if (!result.Succeeded)
    //    {
    //        return result;
    //    }

    //    //Admin user's username can not be changed!
    //    if (user.UserName != AbpUserBase.AdminUserName)
    //    {
    //        if ((GetOldUserName(user.Id)) == AbpUserBase.AdminUserName)
    //        {
    //            throw new UserFriendlyException(string.Format(L("CanNotRenameAdminUser"), AbpUserBase.AdminUserName));
    //        }
    //    }

    //    return base.Update(user);
    //}

    public override async Task<IdentityResult> DeleteAsync(TUser user)
    {
        if (user.UserName == AbpUserBase.AdminUserName)
        {
            throw new UserFriendlyException(string.Format(L("CanNotDeleteAdminUser"), AbpUserBase.AdminUserName));
        }

        var result = await base.DeleteAsync(user);
        if (result.Succeeded)
        {
            await _userLoginRepository.DeleteAsync(userLogin =>
                userLogin.UserId == user.Id &&
                userLogin.TenantId == user.TenantId
            );
        }

        return result;
    }

    // Microsoft.AspNetCore.Identity.UserManager doesn't have required sync version for method calls in this function
    //public override IdentityResult Delete(TUser user)
    //{
    //    if (user.UserName == AbpUserBase.AdminUserName)
    //    {
    //        throw new UserFriendlyException(string.Format(L("CanNotDeleteAdminUser"), AbpUserBase.AdminUserName));
    //    }

    //    return base.Delete(user);
    //}

    public virtual async Task<IdentityResult> ChangePasswordAsync(TUser user, string newPassword)
    {
        var errors = new List<IdentityError>();

        foreach (var validator in PasswordValidators)
        {
            var validationResult = await validator.ValidateAsync(this, user, newPassword);
            if (!validationResult.Succeeded)
            {
                errors.AddRange(validationResult.Errors);
            }
        }

        if (errors.Any())
        {
            return IdentityResult.Failed(errors.ToArray());
        }

        await AbpUserStore.SetPasswordHashAsync(user, PasswordHasher.HashPassword(user, newPassword));

        await UpdateSecurityStampAsync(user);

        return IdentityResult.Success;
    }

    // IPasswordValidator doesn't have a sync version of Validate(...)
    //public virtual IdentityResult ChangePassword(TUser user, string newPassword)
    //{
    //    var errors = new List<IdentityError>();

    //    foreach (var validator in PasswordValidators)
    //    {
    //        var validationResult = validator.Validate(this, user, newPassword);
    //        if (!validationResult.Succeeded)
    //        {
    //            errors.AddRange(validationResult.Errors);
    //        }
    //    }

    //    if (errors.Any())
    //    {
    //        return IdentityResult.Failed(errors.ToArray());
    //    }

    //    AbpUserStore.SetPasswordHash(user, PasswordHasher.HashPassword(user, newPassword));
    //    return IdentityResult.Success;
    //}

    public virtual async Task<IdentityResult> CheckDuplicateUsernameOrEmailAddressAsync(long? expectedUserId,
        string userName, string? emailAddress)
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            return IdentityResult.Success;

        var user = (await FindByNameAsync(userName));
        if (user != null && user.Id != expectedUserId)
        {
            throw new UserFriendlyException(string.Format(L("Identity.DuplicateUserName"), userName));
        }

        user = (await FindByEmailAsync(emailAddress));
        if (user != null && user.Id != expectedUserId)
        {
            throw new UserFriendlyException(string.Format(L("Identity.DuplicateEmail"), emailAddress));
        }

        return IdentityResult.Success;
    }

    public virtual async Task<IdentityResult> SetRolesAsync(TUser user, string[] roleNames)
    {
        await AbpUserStore.UserRepository.EnsureCollectionLoadedAsync(user, u => u.Roles);

        //Remove from removed roles
        foreach (var userRole in user.Roles.ToList())
        {
            var role = await RoleManager.FindByIdAsync(userRole.RoleId.ToString());
            if (role != null && roleNames.All(roleName => role.Name != roleName))
            {
                var result = await RemoveFromRoleAsync(user, role.Name);
                if (!result.Succeeded)
                {
                    return result;
                }
            }
        }

        //Add to added roles
        foreach (var roleName in roleNames)
        {
            var role = await RoleManager.GetRoleByNameAsync(roleName);
            if (user.Roles.All(ur => ur.RoleId != role.Id))
            {
                var result = await AddToRoleAsync(user, roleName);
                if (!result.Succeeded)
                {
                    return result;
                }
            }
        }

        return IdentityResult.Success;
    }

    public virtual async Task InitializeOptionsAsync(int? tenantId)
    {
        Options = JsonConvert.DeserializeObject<IdentityOptions>(JsonConvert.SerializeObject(_optionsAccessor.Value)).NotNull("Options deserialization failed");

        //Lockout
        Options.Lockout.AllowedForNewUsers = await IsTrueAsync(
            AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled,
            tenantId
        );

        Options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(
            await GetSettingValueAsync<int>(
                AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds,
                tenantId
            )
        );

        Options.Lockout.MaxFailedAccessAttempts = await GetSettingValueAsync<int>(
            AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout,
            tenantId
        );

        //Password complexity
        Options.Password.RequireDigit = await GetSettingValueAsync<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit,
            tenantId
        );

        Options.Password.RequireLowercase = await GetSettingValueAsync<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase,
            tenantId
        );

        Options.Password.RequireNonAlphanumeric = await GetSettingValueAsync<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric,
            tenantId
        );

        Options.Password.RequireUppercase = await GetSettingValueAsync<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase,
            tenantId
        );

        Options.Password.RequiredLength = await GetSettingValueAsync<int>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength,
            tenantId
        );
    }

    public virtual void InitializeOptions(int? tenantId)
    {
        Options = JsonConvert.DeserializeObject<IdentityOptions>(JsonConvert.SerializeObject(_optionsAccessor.Value)).NotNull("Options deserialization failed");

        //Lockout
        Options.Lockout.AllowedForNewUsers = IsTrue(
            AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled,
            tenantId
        );

        Options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(
            GetSettingValue<int>(
                AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds,
                tenantId)
        );

        Options.Lockout.MaxFailedAccessAttempts = GetSettingValue<int>(
            AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, tenantId);

        //Password complexity
        Options.Password.RequireDigit = GetSettingValue<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit,
            tenantId
        );

        Options.Password.RequireLowercase = GetSettingValue<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase,
            tenantId
        );

        Options.Password.RequireNonAlphanumeric = GetSettingValue<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric,
            tenantId
        );

        Options.Password.RequireUppercase = GetSettingValue<bool>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase,
            tenantId
        );

        Options.Password.RequiredLength = GetSettingValue<int>(
            AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength,
            tenantId
        );
    }

    protected virtual Task<string> GetOldUserNameAsync(long userId)
    {
        return AbpUserStore.GetUserNameFromDatabaseAsync(userId);
    }

    protected virtual string GetOldUserName(long userId)
    {
        return AbpUserStore.GetUserNameFromDatabase(userId);
    }

    private async Task<UserPermissionCacheItem?> GetUserPermissionCacheItemAsync(long userId)
    {
        var cacheKey = userId + "@" + (GetCurrentTenantId() ?? 0);
        return await _cacheManager.GetUserPermissionCache().GetAsync(cacheKey, async () =>
        {
            var user = await FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return null;
            }

            var newCacheItem = new UserPermissionCacheItem(userId);

            foreach (var roleName in await GetRolesAsync(user))
            {
                newCacheItem.RoleIds.Add((await RoleManager.GetRoleByNameAsync(roleName)).Id);
            }

            foreach (var permissionInfo in await UserPermissionStore.GetPermissionsAsync(userId))
            {
                if (permissionInfo.IsGranted)
                {
                    newCacheItem.GrantedPermissions.Add(permissionInfo.Name);
                }
                else
                {
                    newCacheItem.ProhibitedPermissions.Add(permissionInfo.Name);
                }
            }

            return newCacheItem;
        });
    }

    private UserPermissionCacheItem? GetUserPermissionCacheItem(long userId)
    {
        var cacheKey = userId + "@" + (GetCurrentTenantId() ?? 0);
        return _cacheManager.GetUserPermissionCache().Get(cacheKey, () =>
        {
            var user = AbpUserStore.FindById(userId.ToString());
            if (user == null)
            {
                return null;
            }

            var newCacheItem = new UserPermissionCacheItem(userId);

            foreach (var roleName in AbpUserStore.GetRoles(user))
            {
                newCacheItem.RoleIds.Add((RoleManager.GetRoleByName(roleName)).Id);
            }

            foreach (var permissionInfo in UserPermissionStore.GetPermissions(userId))
            {
                if (permissionInfo.IsGranted)
                {
                    newCacheItem.GrantedPermissions.Add(permissionInfo.Name);
                }
                else
                {
                    newCacheItem.ProhibitedPermissions.Add(permissionInfo.Name);
                }
            }

            return newCacheItem;
        });
    }

    public override async Task<IList<string>> GetValidTwoFactorProvidersAsync(TUser user)
    {
        var providers = new List<string>();

        foreach (var provider in await base.GetValidTwoFactorProvidersAsync(user))
        {
            var isEmailProviderEnabled = await IsTrueAsync(
                AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsEmailProviderEnabled,
                user.TenantId
            );

            if (provider == "Email" && !isEmailProviderEnabled)
            {
                continue;
            }

            var isSmsProviderEnabled = await IsTrueAsync(
                AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsSmsProviderEnabled,
                user.TenantId
            );

            if (provider == "Phone" && !isSmsProviderEnabled)
            {
                continue;
            }

            providers.Add(provider);
        }

        return providers;
    }

    private bool IsTrue(string settingName, int? tenantId)
    {
        return GetSettingValue<bool>(settingName, tenantId);
    }

    private Task<bool> IsTrueAsync(string settingName, int? tenantId)
    {
        return GetSettingValueAsync<bool>(settingName, tenantId);
    }

    private T GetSettingValue<T>(string settingName, int? tenantId) where T : struct
    {
        return tenantId == null
            ? _settingManager.GetSettingValueForApplication<T>(settingName)
            : _settingManager.GetSettingValueForTenant<T>(settingName, tenantId.Value);
    }

    private Task<T> GetSettingValueAsync<T>(string settingName, int? tenantId) where T : struct
    {
        return tenantId == null
            ? _settingManager.GetSettingValueForApplicationAsync<T>(settingName)
            : _settingManager.GetSettingValueForTenantAsync<T>(settingName, tenantId.Value);
    }

    protected virtual string L(string name)
    {
        return LocalizationManager.GetString(LocalizationSourceName, name);
    }

    protected virtual string L(string name, CultureInfo cultureInfo)
    {
        return LocalizationManager.GetString(LocalizationSourceName, name, cultureInfo);
    }

    private int? GetCurrentTenantId()
    {
        if (_unitOfWorkManager.Current != null)
        {
            return _unitOfWorkManager.Current.GetTenantId();
        }

        return AbpSession.TenantId;
    }

    private MultiTenancySides GetCurrentMultiTenancySide()
    {
        if (_unitOfWorkManager.Current != null)
        {
            return MultiTenancy.IsEnabled && !_unitOfWorkManager.Current.GetTenantId().HasValue
                ? MultiTenancySides.Host
                : MultiTenancySides.Tenant;
        }

        return AbpSession.MultiTenancySide;
    }

    public virtual async Task AddTokenValidityKeyAsync(
        TUser user,
        string tokenValidityKey,
        DateTime expireDate,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        await AbpUserStore.AddTokenValidityKeyAsync(user, tokenValidityKey, expireDate, cancellationToken);
    }

    public virtual void AddTokenValidityKey(
        TUser user,
        string tokenValidityKey,
        DateTime expireDate,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        AbpUserStore.AddTokenValidityKey(user, tokenValidityKey, expireDate, cancellationToken);
    }

    public virtual async Task AddTokenValidityKeyAsync(
        UserIdentifier user,
        string tokenValidityKey,
        DateTime expireDate,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        await AbpUserStore.AddTokenValidityKeyAsync(user, tokenValidityKey, expireDate, cancellationToken);
    }

    public virtual void AddTokenValidityKey(
        UserIdentifier user,
        string tokenValidityKey,
        DateTime expireDate,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        AbpUserStore.AddTokenValidityKey(user, tokenValidityKey, expireDate, cancellationToken);
    }

    public virtual async Task<bool> IsTokenValidityKeyValidAsync(
        TUser user,
        string tokenValidityKey,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        return await AbpUserStore.IsTokenValidityKeyValidAsync(user, tokenValidityKey, cancellationToken);
    }

    public virtual bool IsTokenValidityKeyValid(
        TUser user,
        string tokenValidityKey,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        return AbpUserStore.IsTokenValidityKeyValid(user, tokenValidityKey, cancellationToken);
    }

    public virtual async Task RemoveTokenValidityKeyAsync(
        TUser user,
        string tokenValidityKey,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        await AbpUserStore.RemoveTokenValidityKeyAsync(user, tokenValidityKey, cancellationToken);
    }

    public virtual void RemoveTokenValidityKey(
        TUser user,
        string tokenValidityKey,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        AbpUserStore.RemoveTokenValidityKey(user, tokenValidityKey, cancellationToken);
    }

    public bool IsLockedOut(string userId)
    {
        var user = AbpUserStore.FindById(userId);
        if (user == null)
        {
            throw new AbpException("There is no user with id: " + userId);
        }

        var lockoutEndDateUtc = AbpUserStore.GetLockoutEndDate(user);
        return lockoutEndDateUtc > DateTimeOffset.UtcNow;
    }

    public bool IsLockedOut(TUser user)
    {
        var lockoutEndDateUtc = AbpUserStore.GetLockoutEndDate(user);
        return lockoutEndDateUtc > DateTimeOffset.UtcNow;
    }

    public void ResetAccessFailedCount(TUser user)
    {
        AbpUserStore.ResetAccessFailedCount(user);
    }
}