using System.Threading.Tasks;
using Abp.Configuration;
using Abp.Dependency;

namespace Shesha.Firebase.Configuration
{
    public class FirebaseSettings: IFirebaseSettings, ITransientDependency
    {
        protected ISettingManager SettingManager { get; }

        public FirebaseSettings(ISettingManager settingManager)
        {
            SettingManager = settingManager;
        }
        
        public async Task<string> GetServiceAccountJson(int? tenantId)
        {
            return tenantId.HasValue
                ? await SettingManager.GetSettingValueForTenantAsync(FirebaseSettingNames.ServiceAccountJson, tenantId.Value)
                : await SettingManager.GetSettingValueForApplicationAsync(FirebaseSettingNames.ServiceAccountJson);
        }

        public async Task SetServiceAccountJson(string value, int? tenantId)
        {
            if (tenantId.HasValue)
                await SettingManager.ChangeSettingForTenantAsync(tenantId.Value, FirebaseSettingNames.ServiceAccountJson, value);
            else
                await SettingManager.ChangeSettingForApplicationAsync(FirebaseSettingNames.ServiceAccountJson, value);
        }
    }
}
