using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationChannelConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationChannelConfig")]
    [Prefix(UsePrefixes = false)]
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
        public virtual RefListNotificationMessageFormat? SupportedFormat { get; set; }
        /// <summary>
        /// The maximum supported size for the message in characters
        /// </summary>
        public virtual int MaxMessageSize { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        [MultiValueReferenceList("ChannelSupportedMechanism")]
        public virtual RefListChannelSupportedMechanism? SupportedMechanism { get; set; }
        /// <summary>
        /// The fully qualified name of the class implementing the behavior for this channel through INotificationChannel
        /// </summary>
        public virtual string SenderTypeName { get; set; }
        /// <summary>
        /// The default priority of the message unless overridden during the send operation
        /// </summary>
        public virtual RefListNotificationPriority? DefaultPriority { get; set; }
        /// <summary>
        /// Enabled, Disabled, Suppressed - if suppressed will 'pretend' like the notification will be send, but will simply not send the message
        /// </summary>
        public virtual RefListNotificationChannelStatus? Status { get; set; }
        /// <summary>
        /// If true indicates that this channel supports attachments
        /// </summary>
        public virtual bool SupportsAttachment { get; set; }
    }
}
