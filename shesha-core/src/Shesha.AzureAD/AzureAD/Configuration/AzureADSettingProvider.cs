using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;
using Abp.Zero;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// Defines AzureAD settings.
    /// </summary>
    public class AzureADSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public AzureADSettingProvider()
        {
            LocalizationSourceName = "Shesha.AzureAD";
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
                   {
                       new SettingDefinition(AzureADSettingNames.IsEnabled, "false", L("AzureAD_IsEnabled"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(AzureADSettingNames.InstanceUrl, null, L("AzureAD_InstanceUrl"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(AzureADSettingNames.Tenant, null, L("AzureAD_Tenant"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(AzureADSettingNames.AppIdUri, null, L("AzureAD_AppIdUri"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(AzureADSettingNames.ClientApplicationId, null, L("AzureAD_ClientApplicationId"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false)
                   };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
