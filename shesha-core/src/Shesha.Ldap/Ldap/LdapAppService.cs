using Shesha.Ldap.Configuration;
using Shesha.Ldap.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.Ldap
{
    /// inheritDoc
    [Obsolete]
    public class LdapAppService: ILdapAppService
    {
        private readonly ILdapSettings _settings;

        public LdapAppService(ILdapSettings settings)
        {
            _settings = settings;
        }

        /// inheritDoc
        public async Task UpdateSettings(LdapSettingsDto dto)
        {
            await _settings.IsEnabled.SetValueAsync(dto.IsEnabled);
            await _settings.Server.SetValueAsync(dto.Server);
            await _settings.Port.SetValueAsync(dto.Port);
            await _settings.UseSsl.SetValueAsync(dto.UseSsl);
            await _settings.Domain.SetValueAsync(dto.Domain);
        }

        /// inheritDoc
        public async Task<LdapSettingsDto> GetSettings()
        {
            var settings = new LdapSettingsDto
            {
                IsEnabled = await _settings.IsEnabled.GetValueAsync(),
                Server = await _settings.Server.GetValueAsync(),
                Port = await _settings.Port.GetValueAsync(),
                UseSsl = await _settings.UseSsl.GetValueAsync(),
                Domain = await _settings.Domain.GetValueAsync()
            };

            return settings;
        }
    }
}
