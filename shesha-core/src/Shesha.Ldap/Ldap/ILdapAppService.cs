using Abp.Application.Services;
using Shesha.Ldap.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.Ldap
{
    /// <summary>
    /// LDAP application service
    /// </summary>
    [Obsolete]
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
