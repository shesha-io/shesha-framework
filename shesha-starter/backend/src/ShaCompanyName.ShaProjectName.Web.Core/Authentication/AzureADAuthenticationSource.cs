using Shesha.Authorization.Users;
using Shesha.AzureAD.Authentication;
using Shesha.AzureAD.Configuration;
using Shesha.MultiTenancy;

namespace ShaCompanyName.ShaProjectName.Authentication
{
    /// <summary>
    /// 
    /// </summary>
    public class EtkAzureADAuthenticationSource : AzureADAuthenticationSource<Tenant, User>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="ldapModuleConfig"></param>
        public EtkAzureADAuthenticationSource(IAzureADSettings settings, ISheshaAzureADModuleConfig ldapModuleConfig)
            : base(settings, ldapModuleConfig)
        {
        }
    }
}
