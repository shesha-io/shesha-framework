using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// Defines LDAP settings.
    /// </summary>
    public class LdapSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "LDAP";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<bool>(
                    LdapSettingNames.IsEnabled,
                    false,
                    "Is Enabled"
                )
                { Category = CategoryName },
                new SettingDefinition<string>(
                    LdapSettingNames.Server,
                    null,
                    "LDAP Server"
                )
                { Category = CategoryName },
                new SettingDefinition<int>(
                    LdapSettingNames.Port,
                    389,
                    "Port"
                )
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    LdapSettingNames.UseSsl,
                    false,
                    "Use SSL")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    LdapSettingNames.Domain,
                    null,
                    "Domain"
                )
                { Category = CategoryName }
            );
        }
    }
}
