using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification channel manager
    /// </summary>
    public class NotificationChannelManager : ConfigurationItemManager<NotificationChannelConfig>, INotificationChannelManager, ITransientDependency
    {
        protected override Task CopyItemPropertiesAsync(NotificationChannelConfig source, NotificationChannelConfig destination)
        {
            destination.SupportedFormat = source.SupportedFormat;
            destination.MaxMessageSize = source.MaxMessageSize;
            destination.SupportedMechanism = source.SupportedMechanism;
            destination.SenderTypeName = source.SenderTypeName;
            destination.DefaultPriority = source.DefaultPriority;
            destination.Status = source.Status;
            destination.SupportsAttachment = source.SupportsAttachment;

            return Task.CompletedTask;
        }
    }
}
