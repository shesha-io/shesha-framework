using System.Threading.Tasks;
using Abp.Configuration;
using Abp.Dependency;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// Implements <see cref="IAzureADSettings"/> to get settings from <see cref="ISettingManager"/>.
    /// </summary>
    
    public class AzureADSettings : IAzureADSettings, ITransientDependency
    {
        protected ISettingManager SettingManager { get; }

        public AzureADSettings(ISettingManager settingManager)
        {
            SettingManager = settingManager;
        }


        public virtual Task<bool> GetIsEnabled(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync<bool>(AzureADSettingNames.IsEnabled, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync<bool>(AzureADSettingNames.IsEnabled);
        }

        public virtual Task<string> GetInstanceUrl(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(AzureADSettingNames.InstanceUrl, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(AzureADSettingNames.InstanceUrl);
        }

        public virtual Task<string> GetTenant(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(AzureADSettingNames.Tenant, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(AzureADSettingNames.Tenant);
        }

        public virtual Task<string> GetAppIdUri(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(AzureADSettingNames.AppIdUri, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(AzureADSettingNames.AppIdUri);
        }

        public virtual Task<string> GetClientApplicationId(int? tenantId)
        {
            return tenantId.HasValue
                ? SettingManager.GetSettingValueForTenantAsync(AzureADSettingNames.ClientApplicationId, tenantId.Value)
                : SettingManager.GetSettingValueForApplicationAsync(AzureADSettingNames.ClientApplicationId);
        }
    }
}