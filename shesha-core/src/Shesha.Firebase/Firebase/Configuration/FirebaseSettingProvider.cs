using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;
using Abp.Zero;

namespace Shesha.Firebase.Configuration
{
    /// <summary>
    /// Defines Firebase settings.
    /// </summary>
    public class FirebaseSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public FirebaseSettingProvider()
        {
            LocalizationSourceName = AbpZeroConsts.LocalizationSourceName;
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(FirebaseSettingNames.ServiceAccountJson, "", L("Firebase_ServiceAccountJson"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
            };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
