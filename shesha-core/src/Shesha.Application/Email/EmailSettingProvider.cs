using Abp.Dependency;
using Shesha.Configuration;
using Shesha.Settings;

namespace Shesha.Email
{
    public class EmailSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryEmail = "Email";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<bool>(
                    SheshaSettingNames.Email.SupportSmtpRelay,
                    false,
                    "Support SMTP relay"
                )
                { Category = CategoryEmail },

                new SettingDefinition<string>(
                    SheshaSettingNames.Email.RedirectAllMessagesTo,
                    "",
                    "Redirect all messages to"
                )
                { Category = CategoryEmail },

                new SettingDefinition<bool>(
                    SheshaSettingNames.Email.EmailsEnabled,
                    true,
                    "Emails enabled"
                )
                { Category = CategoryEmail },

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
        }
    }

    public class EmailSettings 
    { 
        public string SmtpServer { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public int Port { get; set; }
        public bool UseSsl { get; set; }
    }
}
