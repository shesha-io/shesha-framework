using System;
using Abp.Zero.Configuration;

namespace Shesha.Ldap.Configuration
{
    public class SheshaLdapModuleConfig : ISheshaLdapModuleConfig
    {
        public bool IsEnabled { get; private set; }

        public Type AuthenticationSourceType { get; private set; }

        private readonly IAbpZeroConfig _zeroConfig;

        public SheshaLdapModuleConfig(IAbpZeroConfig zeroConfig)
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