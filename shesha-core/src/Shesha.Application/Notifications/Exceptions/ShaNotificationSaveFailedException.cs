using Abp.Notifications;
using System;

namespace Shesha.Notifications.Exceptions
{
    /// <summary>
    /// Notification save failed exception
    /// </summary>
    public class ShaNotificationSaveFailedException: Exception
    {
        public string NotificationName { get; set; }
        public NotificationData NotificationData { get; set; }

        public ShaNotificationSaveFailedException(string notificationName, NotificationData notificationData): base("Failed to save notification")
        {
            NotificationName = notificationName;
            NotificationData = notificationData;
        }
    }
}
