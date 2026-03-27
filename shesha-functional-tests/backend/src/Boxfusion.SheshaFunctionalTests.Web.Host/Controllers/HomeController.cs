using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Controllers;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.Controllers
{
    [AllowAnonymous]
    public class HomeController : SheshaControllerBase
    {
        
        private readonly ISecuritySettings _securitySettings;

        public HomeController(ISecuritySettings securitySettings)
        {
            _securitySettings = securitySettings;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();
                if (!securitySettings.SwaggerUiEnabled)
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
