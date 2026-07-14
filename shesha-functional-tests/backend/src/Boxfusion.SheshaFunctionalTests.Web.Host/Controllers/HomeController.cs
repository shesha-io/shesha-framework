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
            return await RedirectToSwaggerOrDefaultAsync(_securitySettings);
        }
    }
}
