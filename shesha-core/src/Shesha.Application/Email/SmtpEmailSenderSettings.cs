using System;
using System.Globalization;
using Abp.Configuration;
using Abp.Dependency;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Runtime.Session;

namespace Shesha.Email
{
    public class SmtpEmailSenderSettings: ISmtpEmailSenderConfiguration, ITransientDependency
    {
        /// <summary>
        /// Reference to the current Session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        protected readonly ISettingManager SettingManager;
        public SmtpEmailSenderSettings(ISettingManager settingManager)
        {
            SettingManager = settingManager;
            AbpSession = NullAbpSession.Instance;
        }

        public virtual string DefaultFromAddress
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.DefaultFromAddress);
            set => ChangeSetting(EmailSettingNames.DefaultFromAddress, value);
        }

        public virtual string DefaultFromDisplayName
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.DefaultFromDisplayName);
            set => ChangeSetting(EmailSettingNames.DefaultFromDisplayName, value);
        }

        /// <summary>
        /// SMTP Host name/IP.
        /// </summary>
        public virtual string Host
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.Smtp.Host);
            set => ChangeSetting(EmailSettingNames.Smtp.Host, value);
        }

        /// <summary>
        /// SMTP Port.
        /// </summary>
        public virtual int Port
        {
            get => SettingManager.GetSettingValue<int>(EmailSettingNames.Smtp.Port);
            set => ChangeSetting<int>(EmailSettingNames.Smtp.Port, value);
        }

        /// <summary>
        /// User name to login to SMTP server.
        /// </summary>
        public virtual string UserName
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.Smtp.UserName);
            set => ChangeSetting(EmailSettingNames.Smtp.UserName, value);
        }

        /// <summary>
        /// Password to login to SMTP server.
        /// </summary>
        public virtual string Password
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.Smtp.Password);
            set => ChangeSetting(EmailSettingNames.Smtp.Password, value);
        }

        /// <summary>
        /// Domain name to login to SMTP server.
        /// </summary>
        public virtual string Domain
        {
            get => SettingManager.GetSettingValue(EmailSettingNames.Smtp.Domain);
            set => ChangeSetting(EmailSettingNames.Smtp.Domain, value);
        }

        /// <summary>
        /// Is SSL enabled?
        /// </summary>
        public virtual bool EnableSsl
        {
            get => SettingManager.GetSettingValue<bool>(EmailSettingNames.Smtp.EnableSsl);
            set => ChangeSetting(EmailSettingNames.Smtp.EnableSsl, value);
        }

        /// <summary>
        /// Use default credentials?
        /// </summary>
        public virtual bool UseDefaultCredentials
        {
            get => SettingManager.GetSettingValue<bool>(EmailSettingNames.Smtp.UseDefaultCredentials);
            set => ChangeSetting(EmailSettingNames.Smtp.UseDefaultCredentials, value);
        }

        /// <summary>
        /// Changes setting for tenant with fallback to application
        /// </summary>
        /// <param name="name"></param>
        /// <param name="value"></param>
        protected void ChangeSetting(string name, string value)
        {
            if (AbpSession.TenantId.HasValue)
                SettingManager.ChangeSettingForTenant(AbpSession.TenantId.Value, EmailSettingNames.Smtp.Host, value);
            else
                SettingManager.ChangeSettingForApplication(EmailSettingNames.Smtp.Host, value);
        }

        protected void ChangeSetting<T>(string name, T value) where T : struct, IConvertible
        {
            ChangeSetting(name, value.ToString(CultureInfo.InvariantCulture));
        }
    }
}
