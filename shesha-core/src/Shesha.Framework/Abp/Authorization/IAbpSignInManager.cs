using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.MultiTenancy;

namespace Shesha.Authorization;

public interface IAbpSignInManager<TTenant, TRole, TUser>
    where TTenant : AbpTenant<TUser>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    Task<SignInResult> SignInOrTwoFactorAsync(AbpLoginResult<TTenant, TUser> loginResult, bool isPersistent, bool? rememberBrowser = null, string? loginProvider = null, bool bypassTwoFactor = false);
    Task SignOutAndSignInAsync(ClaimsIdentity identity, bool isPersistent);
    Task SignInAsync(ClaimsIdentity identity, bool isPersistent);
    Task SignInAsync(TUser user, bool isPersistent, string? authenticationMethod = null);
    Task<int?> GetVerifiedTenantIdAsync();
    Task<bool> IsTwoFactorClientRememberedAsync(TUser user);
    Task RememberTwoFactorClientAsync(TUser user);
}