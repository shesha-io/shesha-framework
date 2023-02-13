using System;
using Abp.Zero.Configuration;

namespace Shesha.AzureAD.Configuration
{
    public class SheshaAzureADModuleConfig : ISheshaAzureADModuleConfig
    {
        public bool IsEnabled { get; private set; }

        public Type AuthenticationSourceType { get; private set; }

        private readonly IAbpZeroConfig _zeroConfig;

        public SheshaAzureADModuleConfig(IAbpZeroConfig zeroConfig)
        {
            _zeroConfig = zeroConfig;
        }

        public void Enable(Type authenticationSourceType)
        {
            AuthenticationSourceType = authenticationSourceType;
            IsEnabled = true;

            _zeroConfig.UserManagement.ExternalAuthenticationSources.Add(authenticationSourceType);
        }
    }
}