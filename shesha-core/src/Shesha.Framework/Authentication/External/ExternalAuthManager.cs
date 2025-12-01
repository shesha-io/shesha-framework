using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;

namespace Shesha.Authentication.External
{
    public class ExternalAuthManager : IExternalAuthManager, ITransientDependency
    {
        private readonly IIocResolver _iocResolver;
        private readonly IExternalAuthConfiguration _externalAuthConfiguration;

        public ExternalAuthManager(IIocResolver iocResolver, IExternalAuthConfiguration externalAuthConfiguration)
        {
            _iocResolver = iocResolver;
            _externalAuthConfiguration = externalAuthConfiguration;
        }

        public async Task<bool> IsValidUserAsync(string provider, string providerKey, string providerAccessCode)
        {
            using (var providerApi = CreateProviderApi(provider))
            {
                return await providerApi.Object.IsValidUserAsync(providerKey, providerAccessCode);
            }
        }

        public async Task<ExternalAuthUserInfo> GetUserInfoAsync(string provider, string accessCode)
        {
            using (var providerApi = CreateProviderApi(provider))
            {
                return await providerApi.Object.GetUserInfoAsync(accessCode);
            }
        }

        public IDisposableDependencyObjectWrapper<IExternalAuthProviderApi> CreateProviderApi(string provider)
        {
            var providerInfo = _externalAuthConfiguration.Providers.FirstOrDefault(p => p.Name == provider);
            if (providerInfo == null)
            {
                throw new Exception("Unknown external auth provider: " + provider);
            }

            var providerApi = _iocResolver.ResolveAsDisposable<IExternalAuthProviderApi>(providerInfo.ProviderApiType);
            providerApi.Object.Initialize(providerInfo);
            return providerApi;
        }

        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (remoteError != null)
            {
                // Handle error during external login (e.g., invalid response, access denied, etc.)
                return RedirectToAction(nameof(Login));
            }
            // Get external login info from the provider
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null) { return RedirectToAction(nameof(Login)); }
            // Check if the user exists in your database
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user == null)
            {
                // User does not exist, so create a new user account
                user = new User
                {
                    UserName = info.Principal.FindFirstValue(ClaimTypes.Email),
                    Email = info.Principal.FindFirstValue(ClaimTypes.Email),
                    Name = info.Principal.FindFirstValue(ClaimTypes.Name)
                };
                // Register the new user
                var result = await _userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    // Associate the external login info with the new user
                    await _userManager.AddLoginAsync(user, info);
                    // Optionally assign roles to the user
                    await _userManager.AddToRoleAsync(user, "DefaultRole");
                }
                else
                {
                    // Handle failure during user creation (e.g., log error, return error view)
                    return View("Error", result.Errors);
                }
            }
            // Sign in the user
            await _signInManager.SignInAsync(user, isPersistent: false);
            return RedirectToLocal(returnUrl);
            // Redirect to the originally requested URL or the default page
        }
    }
}
