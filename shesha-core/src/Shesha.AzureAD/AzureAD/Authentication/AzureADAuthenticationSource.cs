using Abp;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.MultiTenancy;
using Microsoft.Identity.Client;
using Shesha.AzureAD.Configuration;
using System.Linq;
using System.Security;
using System.Threading.Tasks;

namespace Shesha.AzureAD.Authentication
{
    /// <summary>
    /// Implements <see cref="IExternalAuthenticationSource{TTenant,TUser}"/> to authenticate users from AzureAD.
    /// Extend this class using application's User and Tenant classes as type parameters.
    /// Also, all needed methods can be overridden and changed upon your needs.
    /// </summary>
    /// <typeparam name="TTenant">Tenant type</typeparam>
    /// <typeparam name="TUser">User type</typeparam>
    public abstract class AzureADAuthenticationSource<TTenant, TUser> : DefaultExternalAuthenticationSource<TTenant, TUser>, ITransientDependency
        where TTenant : AbpTenant<TUser>
        where TUser : AbpUserBase, new()
    {
        /// <summary>
        /// LDAP
        /// </summary>
        public const string SourceName = "AzureAD";

        public override string Name => SourceName;

        private readonly IAzureADSettings _settings;
        private readonly ISheshaAzureADModuleConfig _ldapModuleConfig;

        protected AzureADAuthenticationSource(IAzureADSettings settings, ISheshaAzureADModuleConfig ldapModuleConfig)
        {
            _settings = settings;
            _ldapModuleConfig = ldapModuleConfig;
        }

        /// <inheritdoc/>
        public override async Task<bool> TryAuthenticateAsync(string userNameOrEmailAddress, string plainPassword, TTenant tenant)
        {
            if (!_ldapModuleConfig.IsEnabled || !(await _settings.IsEnabled.GetValueAsync()))
            {
                return false;
            }
            
            var instanceUrl = await _settings.InstanceUrl.GetValueAsync();
            var azureTenant = await _settings.Tenant.GetValueAsync();
            var appIdUri = await _settings.AppIdUri.GetValueAsync();
            var clientApplicationId = await _settings.ClientApplicationId.GetValueAsync();

            if (string.IsNullOrWhiteSpace(instanceUrl) 
                || string.IsNullOrWhiteSpace(azureTenant)
                || string.IsNullOrWhiteSpace(appIdUri)
                || string.IsNullOrWhiteSpace(clientApplicationId))
                return false;

            var authority = instanceUrl.TrimEnd('/') + "/" + azureTenant;

            var scopes = new string[] { "user.read" };

            var app = PublicClientApplicationBuilder.Create(clientApplicationId)
                .WithAuthority(authority)
                .Build();
            var accounts = await app.GetAccountsAsync();
            var account = accounts.FirstOrDefault();

            if (account != null)
            {
                var result = await app.AcquireTokenSilent(scopes, account).ExecuteAsync();
                return result?.AccessToken != null;
            }
            else
            {
                try
                {
                    var securePassword = new SecureString();
                    foreach (char c in plainPassword)       // you should fetch the password
                        securePassword.AppendChar(c);  // keystroke by keystroke

                    var result = await app.AcquireTokenByUsernamePassword(scopes,
                            userNameOrEmailAddress,
                            securePassword)
                        .ExecuteAsync();
                    return result?.AccessToken != null;
                }
                catch (MsalException)
                {
                    // See details below
                    return false;
                }
            }
        }

        protected virtual async Task CheckIsEnabled(TTenant tenant)
        {
            if (!_ldapModuleConfig.IsEnabled)
            {
                throw new AbpException("Ldap Authentication module is disabled globally!");                
            }

            if (!await _settings.IsEnabled.GetValueAsync())
                throw new AbpException("Azure AD Authentication is disabled! You can enable it by setting '" + AzureADSettingNames.IsEnabled + "' to true");

            /* todo: implement tenants support
            var tenantId = tenant?.Id;
            if (!await _settings.IsEnabled.GetValueAsync())
            {
                throw new AbpException("Ldap Authentication is disabled for given tenant (id:" + tenantId + ")! You can enable it by setting '" + AzureADSettingNames.IsEnabled + "' to true");
            }
            */
        }
    }
}
