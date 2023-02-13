using System.Globalization;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Configuration;
using Abp.Zero.Configuration;
using Shesha.Authorization.Settings.Dto;
using Shesha.Configuration;

namespace Shesha.Authorization.Settings
{
    public class AuthorizationSettingsAppService: ApplicationService
    {
        public async Task UpdateSettings(AuthorizationSettingsDto dto)
        {
            // todo: add tenants support

            //Lockout
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled, dto.IsLockoutEnabled.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds, dto.DefaultAccountLockoutSeconds.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, dto.MaxFailedAccessAttemptsBeforeLockout.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.AutoLogoffTimeout, dto.AutoLogoffTimeout.ToString(CultureInfo.InvariantCulture));

            //Password complexity
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit, dto.RequireDigit.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase, dto.RequireLowercase.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric, dto.RequireNonAlphanumeric.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase, dto.RequireUppercase.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength, dto.RequiredLength.ToString(CultureInfo.InvariantCulture));

            // Password reset
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported, dto.ResetPasswordWithEmailLinkIsSupported.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay, dto.ResetPasswordWithEmailLinkExpiryDelay.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported, dto.ResetPasswordWithSmsOtpIsSupported.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay, dto.ResetPasswordWithSmsOtpExpiryDelay.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported, dto.ResetPasswordWithSecurityQuestionsIsSupported.ToString(CultureInfo.InvariantCulture));
            await SettingManager.ChangeSettingForApplicationAsync(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed, dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed.ToString(CultureInfo.InvariantCulture));
            
        }

        public async Task<AuthorizationSettingsDto> GetSettings()
        {
            var dto = new AuthorizationSettingsDto();
            
            // todo: add tenants support
            int? tenantId = null;

            //Lockout
            dto.IsLockoutEnabled = await IsTrueAsync(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled, tenantId);
            dto.DefaultAccountLockoutSeconds = await GetSettingValueAsync<int>(AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds, tenantId);
            dto.MaxFailedAccessAttemptsBeforeLockout = await GetSettingValueAsync<int>(AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, tenantId);
            dto.AutoLogoffTimeout = await GetSettingValueAsync<int>(SheshaSettingNames.Security.AutoLogoffTimeout, tenantId);

            //Password complexity
            dto.RequireDigit = await GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit, tenantId);
            dto.RequireLowercase = await GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase, tenantId);
            dto.RequireNonAlphanumeric = await GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric, tenantId);
            dto.RequireUppercase = await GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase, tenantId);
            dto.RequiredLength = await GetSettingValueAsync<int>(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength, tenantId);

            // Password reset
            dto.ResetPasswordWithEmailLinkIsSupported = await GetSettingValueAsync<bool>(SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported, tenantId);
            dto.ResetPasswordWithEmailLinkExpiryDelay = await GetSettingValueAsync<int>(SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay, tenantId);
            dto.ResetPasswordWithSmsOtpIsSupported = await GetSettingValueAsync<bool>(SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported, tenantId);
            dto.ResetPasswordWithSmsOtpExpiryDelay = await GetSettingValueAsync<int>(SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay, tenantId);
            dto.ResetPasswordWithSecurityQuestionsIsSupported = await GetSettingValueAsync<bool>(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported, tenantId);
            dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed = await GetSettingValueAsync<int>(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed, tenantId);

            return dto;
        }

        private Task<bool> IsTrueAsync(string settingName, int? tenantId)
        {
            return GetSettingValueAsync<bool>(settingName, tenantId);
        }

        private Task<T> GetSettingValueAsync<T>(string settingName, int? tenantId) where T : struct
        {
            return tenantId == null
                ? SettingManager.GetSettingValueForApplicationAsync<T>(settingName)
                : SettingManager.GetSettingValueForTenantAsync<T>(settingName, tenantId.Value);
        }
    }
}