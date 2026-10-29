using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface IAbpUserClaimsPrincipalFactory<TUser, TRole>
        where TRole : AbpRole<TUser>, new()
        where TUser : AbpUser<TUser>
    {
        Task<ClaimsPrincipal> CreateAsync(TUser user);
    }
}
