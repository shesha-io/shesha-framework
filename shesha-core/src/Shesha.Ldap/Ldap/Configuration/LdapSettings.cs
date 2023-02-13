using System.Threading.Tasks;
using Abp.Configuration;
using Abp.Dependency;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// Implements <see cref="ILdapSettings"/> to get settings from <see cref="ISettingManager"/>.
    /// </summary>
    
    public class LdapSettings : ILdapSettings, ITransientDependency
    {
        protected ISettingManager SettingManager { get; }

        public LdapSettings(ISettingManager settingManager)
        {
            SettingManager = settingManager;
        }


        public virtual Task<bool> GetIsEnabled(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync<bool>(LdapSettingNames.IsEnabled, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync<bool>(LdapSettingNames.IsEnabled);
        }

        public virtual Task<string> GetServer(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(LdapSettingNames.Server, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(LdapSettingNames.Server);
        }

        public virtual Task<int> GetPort(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync<int>(LdapSettingNames.Port, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync<int>(LdapSettingNames.Port);
        }

        public virtual Task<bool> GetUseSsl(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync<bool>(LdapSettingNames.UseSsl, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync<bool>(LdapSettingNames.UseSsl);
        }

        public virtual Task<string> GetDomain(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(LdapSettingNames.Domain, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(LdapSettingNames.Domain);
        }

    }
}