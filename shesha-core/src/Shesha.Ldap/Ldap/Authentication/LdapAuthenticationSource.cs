using System.DirectoryServices.Protocols;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Abp;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.MultiTenancy;
using Shesha.Ldap.Configuration;

namespace Shesha.Ldap.Authentication
{
    /// <summary>
    /// Implements <see cref="IExternalAuthenticationSource{TTenant,TUser}"/> to authenticate users from LDAP.
    /// Extend this class using application's User and Tenant classes as type parameters.
    /// Also, all needed methods can be overridden and changed upon your needs.
    /// </summary>
    /// <typeparam name="TTenant">Tenant type</typeparam>
    /// <typeparam name="TUser">User type</typeparam>
    public abstract class LdapAuthenticationSource<TTenant, TUser> : DefaultExternalAuthenticationSource<TTenant, TUser>, ITransientDependency
        where TTenant : AbpTenant<TUser>
        where TUser : AbpUserBase, new()
    {
        /// <summary>
        /// LDAP
        /// </summary>
        public const string SourceName = "LDAP";

        public override string Name => SourceName;

        private readonly ILdapSettings _settings;
        private readonly ISheshaLdapModuleConfig _ldapModuleConfig;

        protected LdapAuthenticationSource(ILdapSettings settings, ISheshaLdapModuleConfig ldapModuleConfig)
        {
            _settings = settings;
            _ldapModuleConfig = ldapModuleConfig;
        }

        /// <inheritdoc/>
        public override async Task<bool> TryAuthenticateAsync(string userNameOrEmailAddress, string plainPassword, TTenant tenant)
        {
            if (!_ldapModuleConfig.IsEnabled || !(await _settings.GetIsEnabled(tenant?.Id)))
            {
                return false;
            }
            
            try
            {
                var server = await _settings.GetServer(tenant?.Id);
                var port = await _settings.GetPort(tenant?.Id);
                var useSsl = await _settings.GetUseSsl(tenant?.Id);
                string domain = await _settings.GetDomain(tenant?.Id);

                var fullUserName = userNameOrEmailAddress.Contains("@") || string.IsNullOrWhiteSpace(domain)
                    ? userNameOrEmailAddress
                    : userNameOrEmailAddress + "@" + domain;

                using (var ldapConnection = new LdapConnection(new LdapDirectoryIdentifier(server, port)))
                {
                    var networkCredential = new NetworkCredential(fullUserName, plainPassword, null);
                    if (useSsl)
                    {
                        ldapConnection.SessionOptions.SecureSocketLayer = true;
                        ldapConnection.SessionOptions.VerifyServerCertificate = new VerifyServerCertificateCallback(ServerCallBack);
                    }
                    ldapConnection.AuthType = AuthType.Basic;
                    ldapConnection.Bind(networkCredential);
                }

                // if the bind succeeds, the credentials are OK
                return true;
            }
            catch (LdapException ldapException)
            {
                // Unfortunately, invalid credentials fall into this block with a specific error code
                if (ldapException.ErrorCode.Equals(LDAPError_InvalidCredentials))
                    return false;
                throw;
            }
        }

        protected virtual async Task CheckIsEnabled(TTenant tenant)
        {
            if (!_ldapModuleConfig.IsEnabled)
            {
                throw new AbpException("Ldap Authentication module is disabled globally!");                
            }

            var tenantId = tenant?.Id;
            if (!await _settings.GetIsEnabled(tenantId))
            {
                throw new AbpException("Ldap Authentication is disabled for given tenant (id:" + tenantId + ")! You can enable it by setting '" + LdapSettingNames.IsEnabled + "' to true");
            }
        }

        public static bool ServerCallBack(LdapConnection connection, X509Certificate certificate)
        {
            return true;
        }

        private const int LDAPError_InvalidCredentials = 0x31;
    }
}
