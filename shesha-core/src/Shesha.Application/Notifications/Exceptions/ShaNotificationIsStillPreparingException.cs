using Abp.Notifications;
using System;

namespace Shesha.Notifications.Exceptions
{
    /// <summary>
    /// Notification is still preparing exception
    /// </summary>
    public class ShaNotificationIsStillPreparingException : Exception
    {
        public Guid NotificationId { get; private set; }
        public ShaNotificationIsStillPreparingException(Guid notificationId): base($"Notification with id = '{notificationId}' is still preparing")
        {
            NotificationId = notificationId;
        }
    }
}
