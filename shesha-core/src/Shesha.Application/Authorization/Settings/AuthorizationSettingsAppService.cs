using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Authorization.Settings.Dto;
using Shesha.Configuration.Security.Frontend;

namespace Shesha.Authorization.Settings
{
    [Obsolete("To be removed, is used for backward compatibility only")]
    public class AuthorizationSettingsAppService: ApplicationService
    {
        private readonly IUserManagementSettings _userManagementSettings;

        public AuthorizationSettingsAppService(IUserManagementSettings userManagementSettings)
        {
            _userManagementSettings = userManagementSettings;
        }

        public async Task UpdateSettingsAsync(AuthorizationSettingsDto dto)
        {
            // Default Authentication
            await _userManagementSettings.DefaultAuthentication.SetValueAsync(new DefaultAuthenticationSettings
            {
                // Lockout
                UserLockOutEnabled = dto.IsLockoutEnabled,
                DefaultAccountLockoutSeconds = dto.DefaultAccountLockoutSeconds,
                MaxFailedAccessAttemptsBeforeLockout = dto.MaxFailedAccessAttemptsBeforeLockout,

                // Password complexity
                RequireDigit = dto.RequireDigit,
                RequireLowercase = dto.RequireLowercase,
                RequiredLength = dto.RequiredLength,
                RequireNonAlphanumeric = dto.RequireNonAlphanumeric,
                RequireUppercase = dto.RequireUppercase,

                // Password reset
                UseResetPasswordViaEmailLink = dto.ResetPasswordWithEmailLinkIsSupported,
                ResetPasswordEmailLinkLifetime = dto.ResetPasswordWithEmailLinkExpiryDelay,
                UseResetPasswordViaSmsOtp = dto.ResetPasswordWithSmsOtpIsSupported,
                ResetPasswordSmsOtpLifetime = dto.ResetPasswordWithSmsOtpExpiryDelay,
                UseResetPasswordViaSecurityQuestions = dto.ResetPasswordWithSecurityQuestionsIsSupported,
                ResetPasswordViaSecurityQuestionsNumQuestionsAllowed = dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed
            });

            await _userManagementSettings.GeneralFrontendSecuritySettings.SetValueAsync(new GeneralFrontendSecuritySettings
            {
                AutoLogoffAfterInactivity = dto.AutoLogoffAfterInactivity,
                AutoLogoffTimeout = dto.AutoLogoffTimeout
            });
        }

        public async Task<AuthorizationSettingsDto> GetSettingsAsync()
        {
            var defaultAuthSettings = await _userManagementSettings.DefaultAuthentication.GetValueAsync();
            var generalFrontendSettings = await _userManagementSettings.GeneralFrontendSecuritySettings.GetValueAsync();
            var dto = new AuthorizationSettingsDto();
            
            //Lockout
            dto.IsLockoutEnabled = defaultAuthSettings.UserLockOutEnabled;
            dto.DefaultAccountLockoutSeconds = defaultAuthSettings.DefaultAccountLockoutSeconds;
            dto.MaxFailedAccessAttemptsBeforeLockout = defaultAuthSettings.MaxFailedAccessAttemptsBeforeLockout;

            //Password complexity
            dto.RequireDigit = defaultAuthSettings.RequireDigit;
            dto.RequireLowercase = defaultAuthSettings.RequireLowercase;
            dto.RequireNonAlphanumeric = defaultAuthSettings.RequireNonAlphanumeric;
            dto.RequireUppercase = defaultAuthSettings.RequireUppercase;
            dto.RequiredLength = defaultAuthSettings.RequiredLength;

            // Password reset
            dto.ResetPasswordWithEmailLinkIsSupported = defaultAuthSettings.UseResetPasswordViaEmailLink;
            dto.ResetPasswordWithEmailLinkExpiryDelay = defaultAuthSettings.ResetPasswordEmailLinkLifetime;
            dto.ResetPasswordWithSmsOtpIsSupported = defaultAuthSettings.UseResetPasswordViaSmsOtp;
            dto.ResetPasswordWithSmsOtpExpiryDelay = defaultAuthSettings.ResetPasswordSmsOtpLifetime;
            dto.ResetPasswordWithSecurityQuestionsIsSupported = defaultAuthSettings.UseResetPasswordViaSecurityQuestions;
            dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed = defaultAuthSettings.ResetPasswordViaSecurityQuestionsNumQuestionsAllowed;

            // General
            dto.AutoLogoffAfterInactivity = generalFrontendSettings.AutoLogoffAfterInactivity;
            dto.AutoLogoffTimeout = generalFrontendSettings.AutoLogoffTimeout;

            return dto;
        }
    }
}