using Abp.Notifications;
using System;

namespace Shesha.Notifications.Exceptions
{
    /// <summary>
    /// Notification failed and awaiting for retry exception
    /// </summary>
    public class ShaNotificationFailedWaitRetryException : Exception
    {
        public Guid NotificationId { get; private set; }
        public ShaNotificationFailedWaitRetryException(Guid notificationId): base($"Failed to send notification {notificationId}, waiting for retry")
        {
            NotificationId = notificationId;
        }
    }
}
