using Abp;
using Abp.Dependency;
using Abp.Extensions;
using Abp.Notifications;
using Abp.Timing;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Controllers;
using System.Threading.Tasks;

namespace Shesha.Web.Host.Controllers
{
    public class HomeController : SheshaControllerBase
    {
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IIocResolver _iocResolver;
        private readonly ISecuritySettings _securitySettings;

        public HomeController(INotificationPublisher notificationPublisher, IIocResolver iocResolver, ISecuritySettings securitySettings)
        {
            _notificationPublisher = notificationPublisher;
            _iocResolver = iocResolver;
            _securitySettings = securitySettings;
        }

        public async Task<IActionResult> Index()
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();
            if (!securitySettings.SwaggerUiEnabled)
                return Content("API is running", "text/plain");

            return Redirect("/swagger");
        }

        /// <summary>
        /// This is a demo code to demonstrate sending notification to default tenant admin and host admin uers.
        /// Don't use this code in production !!!
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task<ActionResult> TestNotification(string message = "")
        {
            if (message.IsNullOrEmpty())
            {
                message = "This is a test notification, created at " + Clock.Now;
            }

            var defaultTenantAdmin = new UserIdentifier(1, 2);
            var hostAdmin = new UserIdentifier(null, 1);

            await _notificationPublisher.PublishAsync(
                "App.SimpleMessage",
                new MessageNotificationData(message),
                severity: NotificationSeverity.Info,
                userIds: new[] { defaultTenantAdmin, hostAdmin }
            );

            return Content("Sent notification: " + message);
        }
    }
}
