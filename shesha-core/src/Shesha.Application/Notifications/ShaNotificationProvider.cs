using System;
using System.Collections.Generic;
using System.Text;
using Abp.Authorization;
using Abp.Localization;
using Abp.Notifications;

namespace Shesha.Notifications
{
    public class ShaNotificationProvider: NotificationProvider
    {
        public override void SetNotifications(INotificationDefinitionContext context)
        {
            context.Manager.Add(
                new NotificationDefinition(
                    "ShaMyCustomEvent",
                    displayName: new LocalizableString("NewUserRegisteredNotificationDefinition", "MyLocalizationSourceName"),
                    permissionDependency: null //new SimplePermissionDependency("App.Pages.UserManagement")
                )
            );
        }
    }
}
