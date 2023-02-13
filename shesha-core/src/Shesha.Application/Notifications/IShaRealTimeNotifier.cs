using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.NotificationMessages.Dto;

namespace Shesha.Notifications
{
    /// <summary>
    /// Shesha real time notifier
    /// </summary>
    public interface IShaRealTimeNotifier: IRealTimeNotifier
    {
        /// <summary>
        /// Send template-based notifications
        /// </summary>
        Task SendNotificationsAsync(List<NotificationMessageDto> notificationMessages);

        /// <summary>
        /// Re-send <see cref="NotificationMessage"/> with the specified Id
        /// </summary>
        Task ResendMessageAsync(NotificationMessageDto notificationMessage);

        /// <summary>
        /// Type of notifications processed by this notifier
        /// </summary>
        RefListNotificationType NotificationType { get; }
    }
}
