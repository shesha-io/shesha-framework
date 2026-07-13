using Abp.Authorization;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.MultiTenancy;

namespace Shesha.Identity
{
    public class SecurityStampValidator : AbpSecurityStampValidator<Tenant, Role, User>
    {
        public SecurityStampValidator(
            IOptions<SecurityStampValidatorOptions> options, 
            SignInManager signInManager,
            ILoggerFactory loggerFactory,
            IUnitOfWorkManager unitOfWorkManager
            ) 
            : base(
                  options, 
                  signInManager, 
                  loggerFactory,
                  unitOfWorkManager
                  )
        {
        }
    }
}
