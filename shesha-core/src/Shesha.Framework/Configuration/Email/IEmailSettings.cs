using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration.Email
{
    /// <summary>
    /// Email settings
    /// </summary>
    [Category("Email")]
    public interface IEmailSettings : ISettingAccessors
    {
        /// <summary>
        /// SMTP Settings
        /// </summary>
        [Display(Name = "Email Settings")]
        [Setting(SheshaSettingNames.EmailSettings, EditorFormName = "email-settings")]
        ISettingAccessor<EmailSettings> EmailSettings { get; }

        /// <summary>
        /// SMTP Settings
        /// </summary>
        [Display(Name = "SMTP Settings")]
        [Setting(SheshaSettingNames.SmtpSettings, EditorFormName = "smtp-settings")]
        ISettingAccessor<SmtpSettings> SmtpSettings { get; }  
    }
}
