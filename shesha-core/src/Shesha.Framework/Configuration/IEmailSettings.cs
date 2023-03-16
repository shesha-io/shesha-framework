using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    /// <summary>
    /// Email settings
    /// </summary>
    [Category("Email")]
    public interface IEmailSettings : ISettingAccessors
    {
        /// <summary>
        /// Emails enabled
        /// </summary>
        [Display(Name = "Emails enabled", Description = "If true, all emails are enabled")]
        [Setting(SheshaSettingNames.Email.EmailsEnabled)]
        ISettingAccessor<bool> EmailsEnabled { get; }

        /// <summary>
        /// Redirect all emails to
        /// </summary>
        [Display(Name = "Redirect all emails to", Description = "If not null or empty the all outgoing emails will be sent to this email address, is used for testing only")]
        [Setting(SheshaSettingNames.Email.RedirectAllMessagesTo)]
        ISettingAccessor<string> RedirectAllMessagesTo { get; }

        /// <summary>
        /// SMTP Settings
        /// </summary>
        [Display(Name = "SMTP Settings")]
        [Setting(SheshaSettingNames.Email.SmtpSettings, EditorFormName = "smtp-settings")]
        ISettingAccessor<SmtpSettings> SmtpSettings { get; }
    }    
}
