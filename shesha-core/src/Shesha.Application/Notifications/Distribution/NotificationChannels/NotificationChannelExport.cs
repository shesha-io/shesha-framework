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
    public class NotificationChannelExport : ConfigurableItemExportBase<NotificationChannelConfig, NotificationChannelConfigRevision, DistributedNotificationChannel>, INotificationChannelExport, ITransientDependency
    {
        public NotificationChannelExport()
        {
        }

        public string ItemType => NotificationChannelConfig.ItemTypeName;

        protected override Task MapCustomPropsAsync(NotificationChannelConfig item, NotificationChannelConfigRevision revision, DistributedNotificationChannel result)
        {
            result.SupportedFormat = revision.SupportedFormat;
            result.MaxMessageSize = revision.MaxMessageSize;
            result.SupportedMechanism = revision.SupportedMechanism;
            result.SenderTypeName = revision.SenderTypeName;
            result.DefaultPriority = revision.DefaultPriority;
            result.Status = revision.Status;

            return Task.CompletedTask;
        }
    }
}
