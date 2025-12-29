using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using System.Collections.Generic;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [Prefix(UsePrefixes = false)]
    [JoinedProperty("notification_types", Schema = "frwk")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-notification-type-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [Entity(
        FriendlyName = "Notification",
        TypeShortAlias = "Shesha.Domain.NotificationTypeConfig"
    )]
    [SnakeCaseNaming]
    public class NotificationTypeConfig : ConfigurationItem, INotificationTypeSpecificProps
    {
        public NotificationTypeConfig()
        {
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
        /// 
        /// </summary>
        public virtual bool Disable { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        public virtual bool CanOptOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string Category { get; set; } = string.Empty;

        [SaveAsJson]
        public virtual IList<ConfigurationItemIdentifierDto>? OverrideChannels { get; set; } = new List<ConfigurationItemIdentifierDto>();

        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public virtual bool IsTimeSensitive { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual bool AllowAttachments { get; set; }        
    }
}