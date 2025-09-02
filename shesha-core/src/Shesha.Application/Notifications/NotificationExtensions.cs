using Shesha.Domain;

namespace Shesha.Notifications
{
    internal static class NotificationExtensions
    {
        /// <summary>
        /// Copy notification properties from <paramref name="src"/>
        /// </summary>
        public static TDestination CopyNotificationSpecificPropsFrom<TDestination>(this TDestination dst, INotificationTypeSpecificProps src) where TDestination: INotificationTypeSpecificProps
        {
            dst.IsTimeSensitive = src.IsTimeSensitive;
            dst.AllowAttachments = src.AllowAttachments;
            dst.Disable = src.Disable;
            dst.CanOptOut = src.CanOptOut;
            dst.Category = src.Category;
            dst.OverrideChannels = src.OverrideChannels;
            
            return dst;
        }

        /// <summary>
        /// Copy notification template properties from <paramref name="src"/>
        /// </summary>
        public static TDestination CopyTemplatePropsFrom<TDestination>(this TDestination dst, INotificationTemplateProps src) where TDestination: INotificationTemplateProps
        {
            dst.MessageFormat = src.MessageFormat;
            dst.TitleTemplate = src.TitleTemplate;
            dst.BodyTemplate = src.BodyTemplate;
            
            return dst;
        }
    }
}
