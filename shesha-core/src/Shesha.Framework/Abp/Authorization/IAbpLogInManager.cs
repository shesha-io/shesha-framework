using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.MultiTenancy;

namespace Shesha.Authorization;

public interface IAbpLogInManager<TTenant, TRole, TUser>
    where TTenant : AbpTenant<TUser>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    Task<AbpLoginResult<TTenant, TUser>> LoginAsync(UserLoginInfo login, string? tenancyName = null);
    Task<AbpLoginResult<TTenant, TUser>> LoginAsync(string userNameOrEmailAddress, string plainPassword, string? tenancyName = null, bool shouldLockout = true);
    Task SaveLoginAttemptAsync(AbpLoginResult<TTenant, TUser> loginResult, string tenancyName, string userNameOrEmailAddress);
    void SaveLoginAttempt(AbpLoginResult<TTenant, TUser> loginResult, string tenancyName, string userNameOrEmailAddress);
}