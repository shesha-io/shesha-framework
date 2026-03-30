using Abp;
using Abp.Extensions;
using Abp.Notifications;
using Abp.Timing;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Controllers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Shesha.Web.Host.Controllers
{
    [AllowAnonymous]
    public class HomeController : SheshaControllerBase
    {
        private readonly INotificationPublisher _notificationPublisher;
        private readonly ISecuritySettings _securitySettings;

        public HomeController(INotificationPublisher notificationPublisher, ISecuritySettings securitySettings)
        {
            _notificationPublisher = notificationPublisher;
            _securitySettings = securitySettings;
        }

        public async Task<IActionResult> Index()
        {
            return await RedirectToSwaggerOrDefaultAsync(_securitySettings);
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
