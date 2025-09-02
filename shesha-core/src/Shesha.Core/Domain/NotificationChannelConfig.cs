using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class NotificationChannelConfigBase : ConfigurationItem<NotificationChannelConfigRevision> 
    { 
    }

    [Entity(
        FriendlyName = "Notification Channel",
        TypeShortAlias = "Shesha.Domain.NotificationChannelConfig"
    )]
    //[JoinedProperty("notification_channels", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]    
    [Prefix(UsePrefixes = false)]    
    public class NotificationChannelConfig : NotificationChannelConfigBase
    {
        public NotificationChannelConfig()
        {
        }

        /// <summary>
        /// 
        /// </summary>
        public const string ItemTypeName = "notification-channel";

        /// <summary>
        /// 
        /// </summary>
        public override string ItemType => ItemTypeName;
    }
}
