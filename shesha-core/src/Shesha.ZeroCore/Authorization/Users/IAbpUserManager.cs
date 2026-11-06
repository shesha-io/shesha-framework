using Abp.Authorization.Roles;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Abp.Authorization.Users;

public interface IAbpUserManager<TRole, TUser>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    Task<IQueryable<TUser>> GetUsersAsync();
    Task<bool> IsGrantedAsync(long userId, string permissionName);
    bool IsGranted(long userId, string permissionName);
    Task<bool> IsGrantedAsync(TUser user, Permission permission);
    bool IsGranted(TUser user, Permission permission);
    Task<bool> IsGrantedAsync(long userId, Permission permission);
    bool IsGranted(long userId, Permission permission);
    Task<IReadOnlyList<Permission>> GetGrantedPermissionsAsync(TUser user);
    Task SetGrantedPermissionsAsync(TUser user, IEnumerable<Permission> permissions);
    Task ProhibitAllPermissionsAsync(TUser user);
    Task ResetAllPermissionsAsync(TUser user);
    void ResetAllPermissions(TUser user);
    Task GrantPermissionAsync(TUser user, Permission permission);
    Task ProhibitPermissionAsync(TUser user, Permission permission);
    Task<TUser?> FindByNameOrEmailAsync(string userNameOrEmailAddress);
    TUser? FindByNameOrEmail(string userNameOrEmailAddress);
    Task<List<TUser>> FindAllAsync(UserLoginInfo login);
    List<TUser> FindAll(UserLoginInfo login);
    Task<TUser?> FindAsync(int? tenantId, UserLoginInfo login);
    TUser? Find(int? tenantId, UserLoginInfo login);
    Task<TUser?> FindByNameOrEmailAsync(int? tenantId, string userNameOrEmailAddress);
    TUser? FindByNameOrEmail(int? tenantId, string userNameOrEmailAddress);
    Task<TUser> GetUserByIdAsync(long userId);
    TUser GetUserById(long userId);
    Task<IdentityResult> ChangePasswordAsync(TUser user, string newPassword);
    Task<IdentityResult> CheckDuplicateUsernameOrEmailAddressAsync(long? expectedUserId, string userName, string emailAddress);
    Task<IdentityResult> SetRolesAsync(TUser user, string[] roleNames);
    Task InitializeOptionsAsync(int? tenantId);
    void InitializeOptions(int? tenantId);
    Task AddTokenValidityKeyAsync(TUser user, string tokenValidityKey, DateTime expireDate, CancellationToken cancellationToken = default(CancellationToken));
    void AddTokenValidityKey(TUser user, string tokenValidityKey, DateTime expireDate, CancellationToken cancellationToken = default(CancellationToken));
    Task AddTokenValidityKeyAsync(UserIdentifier user, string tokenValidityKey, DateTime expireDate, CancellationToken cancellationToken = default(CancellationToken));
    void AddTokenValidityKey(UserIdentifier user, string tokenValidityKey, DateTime expireDate, CancellationToken cancellationToken = default(CancellationToken));
    Task<bool> IsTokenValidityKeyValidAsync(TUser user, string tokenValidityKey, CancellationToken cancellationToken = default(CancellationToken));
    bool IsTokenValidityKeyValid(TUser user, string tokenValidityKey, CancellationToken cancellationToken = default(CancellationToken));
    Task RemoveTokenValidityKeyAsync(TUser user, string tokenValidityKey, CancellationToken cancellationToken = default(CancellationToken));
    void RemoveTokenValidityKey(TUser user, string tokenValidityKey, CancellationToken cancellationToken = default(CancellationToken));
    bool IsLockedOut(string userId);
    bool IsLockedOut(TUser user);
    void ResetAccessFailedCount(TUser user);
}