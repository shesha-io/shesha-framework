using Abp.Configuration;
using Abp.Dependency;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Shesha.Configuration;

namespace Shesha.Email
{
    public class SmtpSettings : SmtpEmailSenderConfiguration, ISmtpSettings, ITransientDependency
    {
        /// <summary>
        /// Creates a new <see cref="SmtpEmailSenderConfiguration"/>.
        /// </summary>
        /// <param name="settingManager">Setting manager</param>
        public SmtpSettings(ISettingManager settingManager)
            : base(settingManager)
        {

        }

        /// inheritedDoc
        public bool SupportSmtpRelay => SettingManager.GetSettingValue<bool>(SheshaSettingNames.Email.SupportSmtpRelay);

        /// inheritedDoc
        public string RedirectAllMessagesTo => SettingManager.GetSettingValue(SheshaSettingNames.Email.RedirectAllMessagesTo);

        /// inheritedDoc
        public bool EmailsEnabled => SettingManager.GetSettingValue<bool>(SheshaSettingNames.Email.EmailsEnabled);
    }
}
