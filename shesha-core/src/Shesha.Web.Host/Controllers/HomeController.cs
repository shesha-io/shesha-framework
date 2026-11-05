using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Controllers;
using System.Threading.Tasks;

namespace Shesha.Web.Host.Controllers
{
    public class HomeController : SheshaControllerBase
    {
        private readonly ISecuritySettings _securitySettings;

        public HomeController(ISecuritySettings securitySettings)
        {
            _securitySettings = securitySettings;
        }

        [AllowAnonymous]
        public async Task<IActionResult> Index()
        {
            return await RedirectToSwaggerOrDefaultAsync(_securitySettings);
        }
    }
}
