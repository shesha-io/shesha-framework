using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationChannelConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationChannelConfig")]
    public class NotificationChannelConfig : ConfigurationItemBase
    {
        public NotificationChannelConfig()
        {
            Init();
        }

        private void Init()
        {
            VersionStatus = ConfigurationItemVersionStatus.Draft;
        }

        /// <summary>
        /// 
        /// </summary>
        public const string ItemTypeName = "notification-channel";

        /// <summary>
        /// 
        /// </summary>
        public override string ItemType => ItemTypeName;
        /// <summary>
        /// 
        /// </summary>
        public RefListNotificationMessageFormat? SupportedFormat { get; set; }
        /// <summary>
        /// The maximum supported size for the message in characters
        /// </summary>
        public int MaxMessageSize { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        [MultiValueReferenceList("ChannelSupportedMechanism")]
        public RefListChannelSupportedMechanism? SupportedMechanism { get; set; }
        /// <summary>
        /// The fully qualified name of the class implementing the behavior for this channel through INotificationChannel
        /// </summary>
        public string SenderTypeName { get; set; }
        /// <summary>
        /// The default priority of the message unless overridden during the send operation
        /// </summary>
        public RefListNotificationPriority? DefaultPriority { get; set; }
        /// <summary>
        /// Enabled, Disabled, Suppressed - if suppressed will 'pretend' like the notification will be send, but will simply not send the message
        /// </summary>
        public RefListNotificationChannelStatus? Status { get; set; }
    }
}
