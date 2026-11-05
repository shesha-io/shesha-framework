using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Abp.Authorization;

public interface IAbpUserClaimsPrincipalFactory<TUser, TRole>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    Task<ClaimsPrincipal> CreateAsync(TUser user);
}