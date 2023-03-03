using Abp.Dependency;
using Shesha.Configuration;
using Shesha.Settings;

namespace Shesha.Sms.Configuration
{
    /// <summary>
    /// Sms notifications setting provider
    /// </summary>
    public class SmsSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategorySms = "SMS";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    SheshaSettingNames.Sms.SmsGateway,
                    NullSmsGateway.Uid,
                    "SMS Gateway"
                )
                { Category = CategorySms },
                new SettingDefinition<string>(
                    SheshaSettingNames.Sms.RedirectAllMessagesTo,
                    "Redirect all messages to"
                )
                { 
                    Category = CategorySms,
                    Description = "Is used for testing purposes only"
                }
            );
        }
    }
}
