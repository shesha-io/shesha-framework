using System.Threading.Tasks;

namespace Shesha.Authentication.External
{
    public interface IExternalAuthProviderApi
    {
        ExternalLoginProviderInfo? ProviderInfo { get; }

        Task<bool> IsValidUserAsync(string userId, string accessCode);

        Task<ExternalAuthUserInfo> GetUserInfoAsync(string accessCode);

        void Initialize(ExternalLoginProviderInfo providerInfo);
    }
}
