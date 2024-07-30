using System;
using System.Threading.Tasks;
using Abp;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Notifications;
using Abp.Timing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using Shesha.Controllers;
using Shesha.MultiTenancy;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.Controllers
{
    [AllowAnonymous]
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
