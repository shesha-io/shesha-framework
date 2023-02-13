using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;
using Shesha.Configuration;

namespace Shesha.Tests.DynamicEntities
{
    public class TestSettingsProvider : SettingProvider
    {
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition("TestSetting", "1" ),
                new SettingDefinition("TestSetting2", "a" ),
                new SettingDefinition("TestSetting.Boxfusion.Shesha.GDE.LowestPriorityApplicationTypeToProcessOffersFor.Round1",
                    null,
                    new FixedLocalizableString("NullTestSetting"),
                    scopes: SettingScopes.Application | SettingScopes.Tenant,
                    isInherited: false )
            };
        }
    }
}