using Abp.Notifications;
using System;

namespace Shesha.Notifications.Exceptions
{
    /// <summary>
    /// Notification failed and awaiting for retry exception
    /// </summary>
    public class ShaMessageFailedWaitRetryException : Exception
    {
        public Guid NotificationMessageId { get; private set; }
        public ShaMessageFailedWaitRetryException(Guid notificationMessageId) : base($"Failed to send message {notificationMessageId}, waiting for retry")
        {
            NotificationMessageId = notificationMessageId;
        }
    }
}
