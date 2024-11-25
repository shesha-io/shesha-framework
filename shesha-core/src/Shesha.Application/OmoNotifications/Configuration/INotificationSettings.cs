using Shesha.OmoNotifications.Configuration.Email;
using Shesha.OmoNotifications.Configuration.Sms;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.OmoNotifications.Configuration
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

        /// <summary>
        /// SMS Settings
        /// </summary>
        [Display(Name = "SMS Settings")]
        [Setting(NotificationSettingNames.SmsSettings, EditorFormName = "sms-settings")]
        ISettingAccessor<SmsSettings> SmsSettings { get; }

        /// <summary>
        /// SMTP Settings
        /// </summary>
        [Display(Name = "Email Settings")]
        [Setting(NotificationSettingNames.EmailSettings, EditorFormName = "email-settings")]
        ISettingAccessor<EmailSettings> EmailSettings { get; }
    }
}
