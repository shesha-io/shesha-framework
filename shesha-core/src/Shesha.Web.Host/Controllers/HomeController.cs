using Abp;
using Abp.Dependency;
using Abp.Extensions;
using Abp.Notifications;
using Abp.Timing;
using Microsoft.AspNetCore.Mvc;
using Shesha.Controllers;
using System.Threading.Tasks;

namespace Shesha.Web.Host.Controllers
{
    public class HomeController : SheshaControllerBase
    {
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IIocResolver _iocResolver;

        public HomeController(INotificationPublisher notificationPublisher, IIocResolver iocResolver)
        {
            _notificationPublisher = notificationPublisher;
            _iocResolver = iocResolver;
        }

        public IActionResult Index()
        {
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
