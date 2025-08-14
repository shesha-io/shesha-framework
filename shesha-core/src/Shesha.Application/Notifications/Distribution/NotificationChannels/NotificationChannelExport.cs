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

        public override Task<DistributedNotificationChannel> ExportAsync(NotificationChannelConfig item)
        {
            var revision = item.Revision;

            var result = new DistributedNotificationChannel
            {
                Id = item.Id,
                Name = item.Name,
                ModuleName = item.Module?.Name,
                FrontEndApplication = item.Application?.AppKey,
                ItemType = item.ItemType,

                Label = revision.Label,
                Description = revision.Description,
                OriginId = item.Origin?.Id,
                Suppress = item.Suppress,

                // specific properties
                SupportedFormat = revision.SupportedFormat,
                MaxMessageSize = revision.MaxMessageSize,
                SupportedMechanism = revision.SupportedMechanism,
                SenderTypeName = revision.SenderTypeName,
                DefaultPriority = revision.DefaultPriority,
                Status = revision.Status,
            };

            return Task.FromResult(result);
        }
    }
}
