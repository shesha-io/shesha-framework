using System;

namespace Shesha.Ldap.Configuration
{
    public interface ISheshaLdapModuleConfig
    {
        bool IsEnabled { get; }

        Type AuthenticationSourceType { get; }

        void Enable(Type authenticationSourceType);
    }
}