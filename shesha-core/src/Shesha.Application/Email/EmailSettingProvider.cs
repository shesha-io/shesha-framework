using System.Collections.Generic;
using Abp.Configuration;
using Shesha.Configuration;

namespace Shesha.Email
{
    public class EmailSettingProvider : SettingProvider
    {
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(
                    SheshaSettingNames.Email.SupportSmtpRelay,
                    false.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Email.RedirectAllMessagesTo,
                    ""
                ),
                new SettingDefinition(
                    SheshaSettingNames.Email.EmailsEnabled,
                    true.ToString()
                )
            };
        }
    }
}
