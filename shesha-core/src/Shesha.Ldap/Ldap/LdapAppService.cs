using System.Threading.Tasks;
using Abp.Configuration;
using Shesha.Ldap.Configuration;
using Shesha.Ldap.Dtos;
using Shesha.Utilities;

namespace Shesha.Ldap
{
    /// inheritDoc
    public class LdapAppService: ILdapAppService
    {
        private readonly ISettingManager _settingManager;

        public LdapAppService(ISettingManager settingManager)
        {
            _settingManager = settingManager;
        }

        /// inheritDoc
        public async Task UpdateSettings(LdapSettingsDto dto)
        {
            await _settingManager.ChangeSettingForApplicationAsync(LdapSettingNames.IsEnabled, dto.IsEnabled.ToString());
            await _settingManager.ChangeSettingForApplicationAsync(LdapSettingNames.Server, dto.Server);
            await _settingManager.ChangeSettingForApplicationAsync(LdapSettingNames.Port, dto.Port.ToString());
            await _settingManager.ChangeSettingForApplicationAsync(LdapSettingNames.UseSsl, dto.UseSsl.ToString());
            await _settingManager.ChangeSettingForApplicationAsync(LdapSettingNames.Domain, dto.Domain);
        }

        /// inheritDoc
        public async Task<LdapSettingsDto> GetSettings()
        {
            var settings = new LdapSettingsDto
            {
                IsEnabled = (await _settingManager.GetSettingValueForApplicationAsync(LdapSettingNames.IsEnabled)) == true.ToString(),
                Server = await _settingManager.GetSettingValueForApplicationAsync(LdapSettingNames.Server),
                Port = (await _settingManager.GetSettingValueForApplicationAsync(LdapSettingNames.Port)).ToInt(0),
                UseSsl = (await _settingManager.GetSettingValueForApplicationAsync(LdapSettingNames.UseSsl)) == true.ToString(),
                Domain = await _settingManager.GetSettingValueForApplicationAsync(LdapSettingNames.Domain)
            };

            return settings;
        }
    }
}
