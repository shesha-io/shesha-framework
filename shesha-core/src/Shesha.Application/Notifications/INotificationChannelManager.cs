using Shesha.ConfigurationItems;
using Shesha.Domain;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification channel manager
    /// </summary>
    public interface INotificationChannelManager : IConfigurationItemManager<NotificationChannelConfig>
    {
    }
}
