using System.Collections.Generic;
using Abp.Configuration;
using Abp.Localization;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// Defines BulkSMS gateway settings.
    /// </summary>
    public class BulkSmsSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public BulkSmsSettingProvider()
        {
            LocalizationSourceName = "Shesha";
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(BulkSmsSettingNames.ApiUrl, "http://bulksms.2way.co.za:5567/eapi/submission/send_sms/2/2.0", L("BulkSms_ApiUrl"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.ApiUsername, null, L("BulkSms_ApiUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.ApiPassword, null, L("BulkSms_ApiPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.UseProxy, false.ToString(), L("BulkSms_UseProxy"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.UseDefaultProxyCredentials, true.ToString(), L("BulkSms_UseDefaultProxyCredentials"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.WebProxyAddress, null, L("BulkSms_WebProxyAddress"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.WebProxyUsername, null, L("BulkSms_WebProxyUsername"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                new SettingDefinition(BulkSmsSettingNames.WebProxyPassword, null, L("BulkSms_WebProxyPassword"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
            };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
