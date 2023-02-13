using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace Shesha.Controllers
{
    public abstract class SheshaControllerBase: AbpController
    {
        protected SheshaControllerBase()
        {
            LocalizationSourceName = SheshaConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
