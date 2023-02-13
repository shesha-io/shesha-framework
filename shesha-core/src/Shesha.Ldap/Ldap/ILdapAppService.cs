using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Ldap.Dtos;

namespace Shesha.Ldap
{
    /// <summary>
    /// LDAP application service
    /// </summary>
    public interface ILdapAppService : IApplicationService
    {
        /// <summary>
        /// Update LDAP settings
        /// </summary>
        Task UpdateSettings(LdapSettingsDto dto);

        /// <summary>
        /// Returns LDAP settings
        /// </summary>
        Task<LdapSettingsDto> GetSettings();
    }
}
