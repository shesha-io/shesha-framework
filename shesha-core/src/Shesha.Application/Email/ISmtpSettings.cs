using System.ComponentModel.DataAnnotations;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;

namespace Shesha.Email
{
    /// <summary>
    /// Shesha SMTP settings
    /// </summary>
    public interface ISmtpSettings: ISmtpEmailSenderConfiguration
    {
        /// <summary>
        /// If true, indicate that SMTP relay service will be used where it's needed (e.g. if the application needs to notify one person about the action that was performed by another person then real person's email address will be used for the "from" address, otherwise "Site Email" will be used)
        /// </summary>
        [Display(Name = "Use SMTP relay", Description = "If true, indicate that SMTP relay service will be used where it's needed (e.g. if the application needs to notify one person about the action that was performed by another person then real person's email address will be used for the 'from' address, otherwise 'Site Email' will be used)")]
        bool SupportSmtpRelay { get; }

        /// <summary>
        /// If not null or empty the all outgoing emails will be sent to this email address, is used for testing
        /// </summary>
        [Display(Name = "Redirect all emails to", Description = "If not null or empty the all outgoing emails will be sent to this email address, is used for testing only")]
        string RedirectAllMessagesTo { get; }

        /// <summary>
        /// If true, all emails will be disabled. Is used only for testing
        /// </summary>
        [Display(Name = "Emails Enabled", Description = "If true, all emails are enabled")]
        bool EmailsEnabled { get; }
    }
}
