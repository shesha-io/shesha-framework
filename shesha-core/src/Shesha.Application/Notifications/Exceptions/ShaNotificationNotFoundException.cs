using System;

namespace Shesha.Notifications.Exceptions
{
    /// <summary>
    /// Notification not found exception
    /// </summary>
    public class ShaNotificationNotFoundException : Exception
    {
        public Guid NotificationId { get; private set; }
        public ShaNotificationNotFoundException(Guid notificationId): base($"Notification with id = '{notificationId}' not found")
        {
            NotificationId = notificationId;
        }
    }
}
