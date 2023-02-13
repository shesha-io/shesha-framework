using Abp.Configuration.Startup;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// Extension methods for module zero configurations.
    /// </summary>
    public static class SheshaLdapConfigurationExtensions
    {
        /// <summary>
        /// Configures Shesha LDAP module.
        /// </summary>
        /// <returns></returns>
        public static ISheshaLdapModuleConfig SheshaLdap(this IModuleConfigurations moduleConfigurations)
        {
            return moduleConfigurations.AbpConfiguration.Get<ISheshaLdapModuleConfig>();
        }
    }
}
