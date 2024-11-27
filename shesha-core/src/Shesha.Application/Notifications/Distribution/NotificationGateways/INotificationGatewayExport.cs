using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;

namespace Shesha.Notifications.Distribution.NotificationGateways
{
    /// <summary>
    /// file template import
    /// </summary>
    public interface INotificationGatewayExport : IConfigurableItemExport<NotificationGatewayConfig>
    {
    }
}
