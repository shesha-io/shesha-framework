using System.Threading.Tasks;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.NotificationMessages.Dto;

namespace Shesha.Notifications
{
    /// <summary>
    /// Shesha notifications distributer
    /// </summary>
    public interface IShaNotificationDistributer: INotificationDistributer
    {
        /// <summary>
        /// Re-send <see cref="NotificationMessage"/> with the specified Id
        /// </summary>
        Task ResendMessageAsync(NotificationMessageDto notificationMessage);
    }
}
