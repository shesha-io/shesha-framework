using Shesha.Authorization.Users;
using Shesha.Ldap.Authentication;
using Shesha.Ldap.Configuration;
using Shesha.MultiTenancy;

namespace ShaCompanyName.ShaProjectName.Authentication
{
    public class EtkLdapAuthenticationSource : LdapAuthenticationSource<Tenant, User>
    {
        public EtkLdapAuthenticationSource(ILdapSettings settings, ISheshaLdapModuleConfig ldapModuleConfig)
            : base(settings, ldapModuleConfig)
        {
        }
    }
}
