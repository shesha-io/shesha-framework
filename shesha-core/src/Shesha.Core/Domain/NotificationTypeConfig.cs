using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationTypeConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationTypeConfig")]
    public class NotificationTypeConfig : ConfigurationItemBase, INotificationTypeSpecificProps
    {
        public NotificationTypeConfig()
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
        public const string ItemTypeName = "notification-type";

        /// <summary>
        /// 
        /// </summary>
        public override string ItemType => ItemTypeName;
        /// <summary>
        /// The default priority of the message unless overridden during the send operation
        /// </summary>
        public virtual RefListNotificationPriority? DefaultPriority { get; set; }
        /// <summary>
        ///
        /// </summary>
        public bool AllowAttachments { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool Disable { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        public bool CanOptOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Category { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Serialized JSON string representing override channels.
        /// </summary>
        [SaveAsJson]
        public virtual IList<ConfigurationItemIdentifierDto> OverrideChannels { get; set; } = new List<ConfigurationItemIdentifierDto>();

        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public bool IsTimeSensitive { get; set; }
    }
}
