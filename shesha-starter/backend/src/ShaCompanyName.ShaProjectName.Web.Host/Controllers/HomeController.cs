using Abp.Dependency;
using Abp.Notifications;
using Microsoft.AspNetCore.Mvc;
using Shesha.Controllers;

namespace ShaCompanyName.ShaProjectName.Web.Host.Controllers
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
    }
}
