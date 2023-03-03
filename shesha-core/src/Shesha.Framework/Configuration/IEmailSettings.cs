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
        [Display(Name = "Emails enabled")]
        [SettingAttribute(SheshaSettingNames.Email.EmailsEnabled)]
        ISettingAccessor<bool> EmailsEnabled { get; }

        /// <summary>
        /// Support SMTP relay
        /// </summary>
        [Display(Name = "Support SMTP relay")]
        [SettingAttribute(SheshaSettingNames.Email.SupportSmtpRelay)]
        ISettingAccessor<bool> SupportSmtpRelay { get; }

        /// <summary>
        /// Redirect all messages to
        /// </summary>
        [Display(Name = "Redirect all messages to")]
        [SettingAttribute(SheshaSettingNames.Email.RedirectAllMessagesTo)]
        ISettingAccessor<string> RedirectAllMessagesTo { get; }

        /*
                new SettingDefinition<EmailSettings>(
                    SheshaSettingNames.Email.CustomEmailSettings,
                    new EmailSettings() { SmtpServer = "smtp.mail.com", Username = "myaccount@maill.com", Port = 25 },
                    "Email"
                )
                { 
                    Category = CategoryEmail,
                    EditForm = new ConfigurationItems.ConfigurationItemIdentifier { Name = "email-settings", Module = "Shesha" }
                }
            );         
         */
    }
}
