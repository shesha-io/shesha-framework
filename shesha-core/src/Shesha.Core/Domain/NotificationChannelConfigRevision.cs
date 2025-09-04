using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [JoinedProperty("notification_channel_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(NotificationChannelConfig.ItemTypeName)]
    public class NotificationChannelConfigRevision : ConfigurationItemRevision
    {
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
