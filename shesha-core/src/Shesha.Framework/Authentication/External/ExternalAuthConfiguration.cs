using System.Collections.Generic;
using Abp.Dependency;

namespace Shesha.Authentication.External
{
    public class ExternalAuthConfiguration : IExternalAuthConfiguration, ISingletonDependency
    {
        public List<ExternalLoginProviderInfo> Providers { get; }

        public ExternalAuthConfiguration()
        {
            Providers = new List<ExternalLoginProviderInfo>();
        }

        if (bool.Parse(configuration["Authentication:Microsoft:IsEnabled"]))
        {
            externalAuthConfiguration.Providers.Add(
                new ExternalLoginProviderInfo(
                    MicrosoftAuthProviderApi.Name,  // Name of the provider
                    configuration["Authentication:Microsoft:ClientId"],  // Client ID from appsettings.json
                    configuration["Authentication:Microsoft:ClientSecret"],  // Client Secret from appsettings.json
                    typeof(MicrosoftAuthProviderApi)  // The API type
                )
            );
        }

        if (bool.Parse(configuration["Authentication:Google:IsEnabled"]))
        {
            externalAuthConfiguration.Providers.Add(
                new ExternalLoginProviderInfo(
                    GoogleAuthProviderApi.Name,
                    configuration["Authentication:Google:ClientId"],
                    configuration["Authentication:Google:ClientSecret"],
                    typeof(GoogleAuthProviderApi)
                )
            );
        }

        if (bool.Parse(configuration["Authentication:Facebook:IsEnabled"]))
        {
            externalAuthConfiguration.Providers.Add(
                new ExternalLoginProviderInfo(
                    FacebookAuthProviderApi.Name,
                    configuration["Authentication:Facebook:AppId"],
                    configuration["Authentication:Facebook:AppSecret"],
                    typeof(FacebookAuthProviderApi)
                )
            );
        }
    }
}
