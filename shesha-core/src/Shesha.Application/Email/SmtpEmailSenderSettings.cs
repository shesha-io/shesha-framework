using System;
using System.Globalization;
using Abp.Configuration;
using Abp.Dependency;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Runtime.Session;
using Shesha.Configuration;

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
            get => _emailSettings.SmtpSettings.GetValue()?.DefaultFromAddress;
        }

        public virtual string DefaultFromDisplayName
        {
            get => _emailSettings.SmtpSettings.GetValue()?.DefaultFromDisplayName;
        }

        /// <summary>
        /// SMTP Host name/IP.
        /// </summary>
        public virtual string Host
        {
            get => _emailSettings.SmtpSettings.GetValue()?.Host;
        }

        /// <summary>
        /// SMTP Port.
        /// </summary>
        public virtual int Port
        {
            get => _emailSettings.SmtpSettings.GetValue()?.Port ?? 0;
        }

        /// <summary>
        /// User name to login to SMTP server.
        /// </summary>
        public virtual string UserName
        {
            get => _emailSettings.SmtpSettings.GetValue()?.UserName;
        }

        /// <summary>
        /// Password to login to SMTP server.
        /// </summary>
        public virtual string Password
        {
            get => _emailSettings.SmtpSettings.GetValue()?.Password;
        }

        /// <summary>
        /// Domain name to login to SMTP server.
        /// </summary>
        public virtual string Domain
        {
            get => _emailSettings.SmtpSettings.GetValue()?.Domain;
        }

        /// <summary>
        /// Domain name to login to incoming server.
        /// </summary>
        public virtual string IncomingServer
        {
            get => _emailSettings.SmtpSettings.GetValue()?.IncomingServer;
        }

        /// <summary>
        /// Is SSL enabled?
        /// </summary>
        public virtual bool EnableSsl
        {
            get => _emailSettings.SmtpSettings.GetValue()?.EnableSsl ?? false;
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
