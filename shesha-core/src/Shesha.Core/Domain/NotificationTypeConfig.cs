using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class NotificationTypeConfigBase : ConfigurationItem<NotificationTypeConfigRevision> 
    { 
    }

    [DiscriminatorValue(ItemTypeName)]
    //[JoinedProperty("notification_types", Schema = "frwk")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-notification-type-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [Entity(
        FriendlyName = "Notification",
        TypeShortAlias = "Shesha.Domain.NotificationTypeConfig"
    )]
    [SnakeCaseNaming]
    public class NotificationTypeConfig : NotificationTypeConfigBase
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
    }
}