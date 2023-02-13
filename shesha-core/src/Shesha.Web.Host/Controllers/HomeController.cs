using System;
using System.Threading.Tasks;
using Abp;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Notifications;
using Abp.Timing;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using Shesha.Controllers;

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

        public IActionResult TestNh()
        {
            try
            {
                var userClaimRepository = _iocResolver.Resolve<IRepository<UserClaim, long>>();
                var userClaims = userClaimRepository.GetAllListAsync(uc => uc.UserId == 1);
                userClaims.Wait();
                var r = userClaims.Result;



                var factory = _iocResolver.Resolve<ISessionFactory>();
                var currentSession = factory.GetCurrentSession();

                var user = currentSession.Get<Authorization.Users.User>((Int64)1);
                var tenant = currentSession.Get<MultiTenancy.Tenant>((int)1);
                var role = currentSession.Get<Authorization.Roles.Role>((int)1);

                user.DeleterUser = user;
            }
            catch (Exception e)
            {

            }

            return Content("Test successful");
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
