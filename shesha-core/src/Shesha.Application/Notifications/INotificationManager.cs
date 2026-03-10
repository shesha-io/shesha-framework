using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Notifications.MessageParticipants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification manager
    /// </summary>
    public interface INotificationManager : IConfigurationItemManager<NotificationTypeConfig>
    {
        /// <summary>
        /// Get list of channels for the specified notification type, receiver and priority
        /// </summary>
        /// <param name="type"></param>
        /// <param name="receiver"></param>
        /// <param name="priority"></param>
        /// <returns></returns>
        Task<List<NotificationChannelConfig>> GetChannelsAsync(NotificationTypeConfig type, IMessageReceiver receiver, RefListNotificationPriority priority);
    }
}
