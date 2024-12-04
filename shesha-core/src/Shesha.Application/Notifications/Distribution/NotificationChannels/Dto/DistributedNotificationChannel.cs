using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Notifications.Distribution.NotificationChannels.Dto
{
    /// <summary>
    /// Distributed file template
    /// </summary>
    public class DistributedNotificationChannel: DistributedConfigurableItemBase
    {
        /// <summary>
        /// 
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationMessageFormat")]
        public RefListNotificationMessageFormat? SupportedFormat { get; set; }
        /// <summary>
        /// The maximum supported size for the message in characters
        /// </summary>
        public int MaxMessageSize { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        [MultiValueReferenceList("Shesha.Core", "ChannelSupportedMechanism")]
        public RefListChannelSupportedMechanism? SupportedMechanism { get; set; }
        /// <summary>
        /// The fully qualified name of the class implementing the behavior for this channel through INotificationChannel
        /// </summary>
        public string SenderTypeName { get; set; }
        /// <summary>
        /// The default priority of the message unless overridden during the send operation
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationPriority")]
        public RefListNotificationPriority? DefaultPriority { get; set; }
        /// <summary>
        /// Enabled, Disabled, Suppressed - if suppressed will 'pretend' like the notification will be send, but will simply not send the message
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationChannelStatus")]
        public RefListNotificationChannelStatus? Status { get; set; }
    }
}
