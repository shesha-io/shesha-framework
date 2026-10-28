using Abp.Dependency;
using System.Threading.Tasks;

namespace Shesha.Authentication.External
{
    public abstract class ExternalAuthProviderApiBase : IExternalAuthProviderApi, ITransientDependency
    {
        public ExternalLoginProviderInfo? ProviderInfo { get; set; }

        public void Initialize(ExternalLoginProviderInfo providerInfo)
        {
            ProviderInfo = providerInfo;
        }

        public async Task<bool> IsValidUserAsync(string userId, string accessCode)
        {
            var userInfo = await GetUserInfoAsync(accessCode);
            return userInfo.ProviderKey == userId;
        }

        public abstract Task<ExternalAuthUserInfo> GetUserInfoAsync(string accessCode);
    }
}
