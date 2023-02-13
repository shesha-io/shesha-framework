using System.Threading.Tasks;

namespace Shesha.Firebase.Configuration
{
    /// <summary>
    /// Firebase settings
    /// </summary>
    public interface IFirebaseSettings
    {
        Task<string> GetServiceAccountJson(int? tenantId);
        Task SetServiceAccountJson(string value, int? tenantId);
    }
}
