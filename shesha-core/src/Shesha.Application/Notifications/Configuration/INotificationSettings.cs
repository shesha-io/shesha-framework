using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Notifications.Configuration
{
    /// <summary>
    /// SMS Settings
    /// </summary>
    [Category("Notifications")]
    public interface INotificationSettings : ISettingAccessors
    {
        /// <summary>
        /// SMS Settings
        /// </summary>
        [Display(Name = "Notifications Channels")]
        [Setting(NotificationSettingNames.NotificationSettings, EditorFormName = "notification-settings")]
        ISettingAccessor<NotificationSettings> NotificationSettings { get; }
    }
}
