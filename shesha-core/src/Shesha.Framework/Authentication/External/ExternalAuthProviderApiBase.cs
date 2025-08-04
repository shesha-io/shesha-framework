using System.Threading.Tasks;
using Abp.Dependency;

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

    public class MicrosoftAuthProviderApi : ExternalAuthProviderApiBase
    {
        public const string Name = "Microsoft";

        private readonly HttpClient _httpClient;
        public MicrosoftAuthProviderApi()
        {
            _httpClient = new HttpClient();
        }

        public override async Task<ExternalAuthUserInfo> GetUserInfo(string accessCode)
        {
            // Define the endpoint to retrieve user info from Microsoft
            var userInfoEndpoint = "https://graph.microsoft.com/v1.0/me";

            var request = new HttpRequestMessage(HttpMethod.Get, userInfoEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessCode);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var userInfo = JsonConvert.DeserializeObject<MicrosoftUserInfo>(jsonResponse);

            return new ExternalAuthUserInfo
            {
                Provider = Name,
                ProviderKey = userInfo.Id,
                Name = userInfo.DisplayName,
                EmailAddress = userInfo.UserPrincipalName
            };
        }
    }

    public class GoogleAuthProviderApi : ExternalAuthProviderApiBase
    {
        public const string Name = "Google";

        private readonly HttpClient _httpClient;

        public GoogleAuthProviderApi()
        {
            _httpClient = new HttpClient();
        }

        public override async Task<ExternalAuthUserInfo> GetUserInfo(string accessToken)
        {
            // Google's endpoint for user info
            var userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

            var request = new HttpRequestMessage(HttpMethod.Get, userInfoEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var userInfo = JsonConvert.DeserializeObject<GoogleUserInfo>(jsonResponse);

            return new ExternalAuthUserInfo
            {
                Provider = Name,
                ProviderKey = userInfo.Id,
                Name = userInfo.Name,
                EmailAddress = userInfo.Email
            };
        }
    }

    public class FacebookAuthProviderApi : ExternalAuthProviderApiBase
    {
        public const string Name = "Facebook";

        private readonly HttpClient _httpClient;

        public FacebookAuthProviderApi()
        {
            _httpClient = new HttpClient();
        }

        public override async Task<ExternalAuthUserInfo> GetUserInfo(string accessToken)
        {
            // Facebook's endpoint for user info
            var userInfoEndpoint = "https://graph.facebook.com/me?fields=id,name,email"; // TODO: change these query params

            var response = await _httpClient.GetAsync($"{userInfoEndpoint}&access_token={accessToken}");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var userInfo = JsonConvert.DeserializeObject<FacebookUserInfo>(jsonResponse);

            return new ExternalAuthUserInfo
            {
                Provider = Name,
                ProviderKey = userInfo.Id,
                Name = userInfo.Name,
                EmailAddress = userInfo.Email
            };
        }
    }

    // Define a class for Facebook user info
    public class FacebookUserInfo
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }


    // Define a class for Google user info
    public class GoogleUserInfo
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }


    // Define a class for parsing Microsoft user info
    public class MicrosoftUserInfo
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string UserPrincipalName { get; set; }  // This is the user's email address
    }
}
