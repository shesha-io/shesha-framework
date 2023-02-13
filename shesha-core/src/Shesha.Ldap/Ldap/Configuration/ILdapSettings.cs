using System.DirectoryServices.AccountManagement;
using System.Threading.Tasks;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// Used to obtain current values of LDAP settings.
    /// This abstraction allows to define a different source for settings than SettingManager (see default implementation: <see cref="LdapSettings"/>).
    /// </summary>
    public interface ILdapSettings
    {
        Task<bool> GetIsEnabled(int? tenantId);
        Task<string> GetServer(int? tenantId);
        Task<int> GetPort(int? tenantId);
        Task<bool> GetUseSsl(int? tenantId);
        Task<string> GetDomain(int? tenantId);
    }
}