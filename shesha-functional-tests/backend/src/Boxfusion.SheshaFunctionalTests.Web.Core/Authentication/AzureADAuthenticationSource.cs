using Shesha.Authorization.Users;
using Shesha.AzureAD.Authentication;
using Shesha.AzureAD.Configuration;
using Shesha.MultiTenancy;

namespace Boxfusion.SheshaFunctionalTests.Authentication
{
    public class EtkAzureADAuthenticationSource : AzureADAuthenticationSource<Tenant, User>
    {
        public EtkAzureADAuthenticationSource(IAzureADSettings settings, ISheshaAzureADModuleConfig ldapModuleConfig)
            : base(settings, ldapModuleConfig)
        {
        }
    }
}
