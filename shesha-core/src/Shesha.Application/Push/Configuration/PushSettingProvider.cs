using System.Collections.Generic;
using Abp.Configuration;
using Shesha.Configuration;

namespace Shesha.Push.Configuration
{
    /// <summary>
    /// Push notifications setting provider
    /// </summary>
    public class PushSettingProvider: SettingProvider
    {
        /// inheritedDoc
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(
                    SheshaSettingNames.Push.PushNotifier,
                    NullPushNotifier.Uid
                )
            };
        }
    }
}
