using System.Collections.Generic;
using Abp.Configuration;
using Shesha.Configuration;

namespace Shesha.Sms.Configuration
{
    /// <summary>
    /// Sms notifications setting provider
    /// </summary>
    public class SmsSettingProvider : SettingProvider
    {
        /// inheritedDoc
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(
                    SheshaSettingNames.Sms.SmsGateway,
                    NullSmsGateway.Uid
                ),
                new SettingDefinition(
                    SheshaSettingNames.Sms.RedirectAllMessagesTo,
                    ""
                )
            };
        }
    }
}
