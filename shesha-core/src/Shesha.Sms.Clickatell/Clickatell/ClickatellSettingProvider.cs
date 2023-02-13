using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Defines Clickatell gateway settings.
    /// </summary>
    public class ClickatellSettingProvider : SettingProvider
    {
        public const int DefaultSingleMessageMaxLength = 160;
        public const int DefaultMessagePartLength = 153;

        protected string LocalizationSourceName { get; set; }

        public ClickatellSettingProvider()
        {
            LocalizationSourceName = "Shesha";
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(ClickatellSettingNames.Host, "api.clickatell.com", L("Clickatell_Host"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.ApiId, null, L("Clickatell_ApiId"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.ApiUsername, null, L("Clickatell_ApiUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.ApiPassword, null, L("Clickatell_ApiPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.UseProxy, false.ToString(), L("Clickatell_UseProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.UseDefaultProxyCredentials, true.ToString(), L("Clickatell_UseDefaultProxyCredentials"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.WebProxyAddress, null, L("Clickatell_WebProxyAddress"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.WebProxyUsername, null, L("Clickatell_WebProxyUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.WebProxyPassword, null, L("Clickatell_WebProxyPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),

                new SettingDefinition(ClickatellSettingNames.SingleMessageMaxLength, DefaultSingleMessageMaxLength.ToString(), L("Clickatell_SingleMessageMaxLength"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(ClickatellSettingNames.MessagePartLength, DefaultMessagePartLength.ToString(), L("Clickatell_MessagePartLength"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
            };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
