using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using Abp.Configuration;
using Abp.Localization;
using Abp.Zero;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// Defines LDAP settings.
    /// </summary>
    public class LdapSettingProvider : SettingProvider
    {
        protected string LocalizationSourceName { get; set; }

        public LdapSettingProvider()
        {
            LocalizationSourceName = AbpZeroConsts.LocalizationSourceName;
        }

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
                   {
                       new SettingDefinition(LdapSettingNames.IsEnabled, "false", L("Ldap_IsEnabled"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(LdapSettingNames.Server, ContextType.Domain.ToString(), L("Ldap_Server"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(LdapSettingNames.Port, null, L("Ldap_Port"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(LdapSettingNames.UseSsl, null, L("Ldap_UseSsl"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false),
                       new SettingDefinition(LdapSettingNames.Domain, null, L("Ldap_Domain"), scopes: SettingScopes.Application | SettingScopes.Tenant, isInherited: false)
                   };
        }

        protected virtual ILocalizableString L(string name)
        {
            return new LocalizableString(name, LocalizationSourceName);
        }
    }
}
