using System.Threading.Tasks;

namespace Shesha.Authentication.External
{
    public interface IExternalAuthManager
    {
        Task<bool> IsValidUserAsync(string provider, string providerKey, string providerAccessCode);

        Task<ExternalAuthUserInfo> GetUserInfoAsync(string provider, string accessCode);
    }
}
