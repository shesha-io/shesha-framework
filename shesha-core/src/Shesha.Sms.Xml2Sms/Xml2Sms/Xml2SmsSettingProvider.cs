using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Defines Xml2Sms gateway settings.
    /// </summary>
    public class Xml2SmsSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public Xml2SmsSettingProvider()
        {
            LocalizationSourceName = "Shesha";
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                // todo: set Host by default
                new SettingDefinition(Xml2SmsSettingNames.Host, "", L("Xml2Smsl_Host"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.ApiUsername, null, L("Xml2Sms_ApiUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.ApiPassword, null, L("Xml2Smsl_ApiPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.UseProxy, false.ToString(), L("Xml2Sms_UseProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.UseDefaultProxyCredentials, false.ToString(), L("Xml2Sms_UseADProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.WebProxyAddress, null, L("Xml2Sms_WebProxyAddress"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.WebProxyUsername, null, L("Xml2Sms_WebProxyUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(Xml2SmsSettingNames.WebProxyPassword, null, L("Xml2Sms_WebProxyPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
            };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
