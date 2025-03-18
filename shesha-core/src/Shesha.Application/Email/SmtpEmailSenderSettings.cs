using Abp.Dependency;
using Abp.Net.Mail.Smtp;
using Abp.Runtime.Session;
using Shesha.Configuration.Email;
using System;

namespace Shesha.Email
{
    [Obsolete("To be removed")]
    public class SmtpEmailSenderSettings: ISmtpEmailSenderConfiguration, ITransientDependency
    {
        /// <summary>
        /// Reference to the current Session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        protected readonly IEmailSettings _emailSettings;
        public SmtpEmailSenderSettings(IEmailSettings emailSettings)
        {
            _emailSettings = emailSettings;
            AbpSession = NullAbpSession.Instance;
        }

        public virtual string DefaultFromAddress
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.DefaultFromAddress ?? string.Empty;
        }

        public virtual string DefaultFromDisplayName
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.DefaultFromDisplayName ?? string.Empty;
        }

        /// <summary>
        /// SMTP Host name/IP.
        /// </summary>
        public virtual string Host
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.Host ?? string.Empty;
        }

        /// <summary>
        /// SMTP Port.
        /// </summary>
        public virtual int Port
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.Port ?? 0;
        }

        /// <summary>
        /// User name to login to SMTP server.
        /// </summary>
        public virtual string UserName
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.UserName ?? string.Empty;
        }

        /// <summary>
        /// Password to login to SMTP server.
        /// </summary>
        public virtual string Password
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.Password ?? string.Empty;
        }

        /// <summary>
        /// Domain name to login to SMTP server.
        /// </summary>
        public virtual string Domain
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.Domain ?? string.Empty;
        }

        /// <summary>
        /// Is SSL enabled?
        /// </summary>
        public virtual bool EnableSsl
        {
            get => _emailSettings.SmtpSettings.GetValueOrNull()?.EnableSsl ?? false;
        }

        /// <summary>
        /// Use default credentials?
        /// </summary>
        public virtual bool UseDefaultCredentials
        {
            get => false;
        }
    }
}
