using Abp.Authorization.Users;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Abp.Authorization.Roles;

public interface IAbpRoleManager<TRole, TUser>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    Task<IQueryable<TRole>> GetRolesAsync();
    Task<bool> IsGrantedAsync(string roleName, string permissionName);
    Task<bool> IsGrantedAsync(int roleId, string permissionName);
    Task<bool> IsGrantedAsync(TRole role, Permission permission);
    Task<bool> IsGrantedAsync(int roleId, Permission permission);
    bool IsGranted(int roleId, Permission permission);
    Task<IReadOnlyList<Permission>> GetGrantedPermissionsAsync(int roleId);
    Task<IReadOnlyList<Permission>> GetGrantedPermissionsAsync(string roleName);
    Task<IReadOnlyList<Permission>> GetGrantedPermissionsAsync(TRole role);
    Task SetGrantedPermissionsAsync(int roleId, IEnumerable<Permission> permissions);
    Task SetGrantedPermissionsAsync(TRole role, IEnumerable<Permission> permissions);
    Task GrantPermissionAsync(TRole role, Permission permission);
    Task ProhibitPermissionAsync(TRole role, Permission permission);
    Task ProhibitAllPermissionsAsync(TRole role);
    Task ResetAllPermissionsAsync(TRole role);
    Task<TRole> GetRoleByIdAsync(int roleId);
    Task<TRole> GetRoleByNameAsync(string roleName);
    TRole GetRoleByName(string roleName);
    Task GrantAllPermissionsAsync(TRole role);
    Task<IdentityResult> CreateStaticRoles(int tenantId);
    Task<IdentityResult> CheckDuplicateRoleNameAsync(int? expectedRoleId, string name, string displayName);
}