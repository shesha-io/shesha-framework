using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationChannels.Dto;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationChannels
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationChannelExport : ConfigurableItemExportBase<NotificationChannelConfig, DistributedNotificationChannel>, INotificationChannelExport, ITransientDependency
    {
        public NotificationChannelExport()
        {
        }

        public string ItemType => NotificationChannelConfig.ItemTypeName;

        protected override Task MapCustomPropsAsync(NotificationChannelConfig item, DistributedNotificationChannel result)
        {
            result.SupportedFormat = item.SupportedFormat;
            result.MaxMessageSize = item.MaxMessageSize;
            result.SupportedMechanism = item.SupportedMechanism;
            result.SenderTypeName = item.SenderTypeName;
            result.DefaultPriority = item.DefaultPriority;
            result.Status = item.Status;

            return Task.CompletedTask;
        }
    }
}
