using System.Threading.Tasks;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// Used to obtain current values of AzureAD settings.
    /// This abstraction allows to define a different source for settings than SettingManager (see default implementation: <see cref="AzureADSettings"/>).
    /// </summary>
    public interface IAzureADSettings
    {
        Task<bool> GetIsEnabled(int? tenantId);
        Task<string> GetInstanceUrl(int? tenantId);
        Task<string> GetTenant(int? tenantId);
        Task<string> GetAppIdUri(int? tenantId);
        Task<string> GetClientApplicationId(int? tenantId);
    }
}