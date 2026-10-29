using System.Threading.Tasks;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.MultiTenancy;

namespace Shesha.Authorization;

public class AbpSecurityStampValidator<TTenant, TRole, TUser> : SecurityStampValidator<TUser>
    where TTenant : AbpTenant<TUser>
    where TRole : AbpRole<TUser>, new()
    where TUser : AbpUser<TUser>
{
    private readonly IUnitOfWorkManager _unitOfWorkManager;

    public AbpSecurityStampValidator(
        IOptions<SecurityStampValidatorOptions> options,
        AbpSignInManager<TTenant, TRole, TUser> signInManager,
        ILoggerFactory loggerFactory,
        IUnitOfWorkManager unitOfWorkManager)
        : base(
            options,
            signInManager,
            loggerFactory)
    {
        _unitOfWorkManager = unitOfWorkManager;
    }

    public override async Task ValidateAsync(CookieValidatePrincipalContext context)
    {
        await _unitOfWorkManager.WithUnitOfWorkAsync(async () => { await base.ValidateAsync(context); });
    }
}