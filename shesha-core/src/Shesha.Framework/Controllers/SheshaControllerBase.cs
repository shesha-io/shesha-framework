using System;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Settings;

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

        protected async Task<IActionResult> RedirectToSwaggerOrDefaultAsync(ISecuritySettings securitySettings)
        {
            try
            {
                var settings = await
                    securitySettings.SecuritySettings.GetValueAsync(new SettingManagementContext());
                if (!settings.SwaggerUiEnabled)
                    return Content("API is running", "text/plain");
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
                return Content("API is running", "text/plain");
            }
            
            return Redirect("/swagger");
        }
    }
}
