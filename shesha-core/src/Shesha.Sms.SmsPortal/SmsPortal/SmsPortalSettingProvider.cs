using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;

namespace Shesha.Sms.SmsPortal
{
    /// <summary>
    /// Defines Clickatell gateway settings.
    /// </summary>
    public class SmsPortalSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public SmsPortalSettingProvider()
        {
            LocalizationSourceName = "Shesha";
        }
        
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(SmsPortalSettingNames.Host, "mymobileapi.com/api5/http5.aspx", L("SmsPortal_Host"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.Username, null, L("SmsPortal_Username"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.Password, null, L("SmsPortal_Password"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),

                new SettingDefinition(SmsPortalSettingNames.UseProxy, false.ToString(), L("SmsPortal_UseProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.UseDefaultProxyCredentials, false.ToString(), L("SmsPortal_UseADProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.WebProxyAddress, null, L("SmsPortal_WebProxyAddress"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.WebProxyUsername, null, L("SmsPortal_WebProxyUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(SmsPortalSettingNames.WebProxyPassword, null, L("SmsPortal_WebProxyPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),

            };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
