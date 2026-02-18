using Abp.Application.Services;
using Shesha.Authorization.Settings.Dto;
using Shesha.Configuration;
using Shesha.Configuration.Security;
using System;
using System.Threading.Tasks;

namespace Shesha.Authorization.Settings
{
    [Obsolete("To be removed, is used for backward compatibility only")]
    public class AuthorizationSettingsAppService: ApplicationService
    {
        private readonly IPasswordComplexitySettings _passwordComplexitySettings;
        private readonly ISecuritySettings _securitySettings;

        public AuthorizationSettingsAppService(IPasswordComplexitySettings passwordComplexitySettings, ISecuritySettings securitySettings)
        {
            _passwordComplexitySettings = passwordComplexitySettings;
            _securitySettings = securitySettings;
        }

        public async Task UpdateSettingsAsync(AuthorizationSettingsDto dto)
        {
            //Lockout
            await _securitySettings.UserLockOutEnabled.SetValueAsync(dto.IsLockoutEnabled);
            await _securitySettings.DefaultAccountLockoutSeconds.SetValueAsync(dto.DefaultAccountLockoutSeconds);
            await _securitySettings.MaxFailedAccessAttemptsBeforeLockout.SetValueAsync(dto.MaxFailedAccessAttemptsBeforeLockout);
            await _securitySettings.SecuritySettings.SetValueAsync(new SecuritySettings
            {
                AutoLogoffTimeout = dto.AutoLogoffTimeout,
                UseAutoLogoff = dto.UseAutoLogoff,

                // Password reset
                UseResetPasswordViaEmailLink = dto.ResetPasswordWithEmailLinkIsSupported,
                ResetPasswordEmailLinkLifetime = dto.ResetPasswordWithEmailLinkExpiryDelay,

                UseResetPasswordViaSmsOtp = dto.ResetPasswordWithSmsOtpIsSupported,
                ResetPasswordSmsOtpLifetime = dto.ResetPasswordWithSmsOtpExpiryDelay,

                UseResetPasswordViaSecurityQuestions = dto.ResetPasswordWithSecurityQuestionsIsSupported,
                ResetPasswordViaSecurityQuestionsNumQuestionsAllowed = dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed
            });

            //Password complexity
            await _passwordComplexitySettings.RequireDigit.SetValueAsync(dto.RequireDigit);
            await _passwordComplexitySettings.RequireLowercase.SetValueAsync(dto.RequireLowercase);
            await _passwordComplexitySettings.RequireNonAlphanumeric.SetValueAsync(dto.RequireNonAlphanumeric);
            await _passwordComplexitySettings.RequireUppercase.SetValueAsync(dto.RequireUppercase);
            await _passwordComplexitySettings.RequiredLength.SetValueAsync(dto.RequiredLength);
        }

        public async Task<AuthorizationSettingsDto> GetSettingsAsync()
        {
            var settings = await _securitySettings.SecuritySettings.GetValueAsync();
            var dto = new AuthorizationSettingsDto();
            
            //Lockout
            dto.IsLockoutEnabled = await _securitySettings.UserLockOutEnabled.GetValueAsync();
            dto.DefaultAccountLockoutSeconds = await _securitySettings.DefaultAccountLockoutSeconds.GetValueAsync();
            dto.MaxFailedAccessAttemptsBeforeLockout = await _securitySettings.MaxFailedAccessAttemptsBeforeLockout.GetValueAsync();
            dto.AutoLogoffTimeout = settings.AutoLogoffTimeout;
            dto.UseAutoLogoff = settings.UseAutoLogoff;

            //Password complexity
            dto.RequireDigit = await _passwordComplexitySettings.RequireDigit.GetValueAsync();
            dto.RequireLowercase = await _passwordComplexitySettings.RequireLowercase.GetValueAsync();
            dto.RequireNonAlphanumeric = await _passwordComplexitySettings.RequireNonAlphanumeric.GetValueAsync();
            dto.RequireUppercase = await _passwordComplexitySettings.RequireUppercase.GetValueAsync();
            dto.RequiredLength = await _passwordComplexitySettings.RequiredLength.GetValueAsync();

            // Password reset
            dto.ResetPasswordWithEmailLinkIsSupported =  settings.UseResetPasswordViaEmailLink;
            dto.ResetPasswordWithEmailLinkExpiryDelay = settings.ResetPasswordEmailLinkLifetime;
            dto.ResetPasswordWithSmsOtpIsSupported = settings.UseResetPasswordViaSmsOtp;
            dto.ResetPasswordWithSmsOtpExpiryDelay = settings.ResetPasswordSmsOtpLifetime;
            dto.ResetPasswordWithSecurityQuestionsIsSupported = settings.UseResetPasswordViaSecurityQuestions;
            dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed = settings.ResetPasswordViaSecurityQuestionsNumQuestionsAllowed;

            return dto;
        }
    }
}