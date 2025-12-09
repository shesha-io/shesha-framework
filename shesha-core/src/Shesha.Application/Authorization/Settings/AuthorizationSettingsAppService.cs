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
            var existingSettings = await _userManagementSettings.DefaultAuthentication.GetValueAsync();

            // Default Authentication
            await _userManagementSettings.DefaultAuthentication.SetValueAsync(new DefaultAuthenticationSettings
            {
                // Preserve existing OTP and registration settings
                RequireOtpVerification = existingSettings.RequireOtpVerification,
                AllowLocalUsernamePasswordAuth = existingSettings.AllowLocalUsernamePasswordAuth,
                UseDefaultRegistrationForm = existingSettings.UseDefaultRegistrationForm,
                UserEmailAsUsername = existingSettings.UserEmailAsUsername,
                CustomRegistrationForm = existingSettings.CustomRegistrationForm,
                SupportedVerificationMethods = existingSettings.SupportedVerificationMethods,
                PasswordLength = existingSettings.PasswordLength,
                Alphabet = existingSettings.Alphabet,
                DefaultLifetime = existingSettings.DefaultLifetime,
                IgnoreOtpValidation = existingSettings.IgnoreOtpValidation,
                DefaultSubjectTemplate = existingSettings.DefaultSubjectTemplate,
                DefaultBodyTemplate = existingSettings.DefaultBodyTemplate,
                DefaultEmailSubjectTemplate = existingSettings.DefaultEmailSubjectTemplate,
                DefaultEmailBodyTemplate = existingSettings.DefaultEmailBodyTemplate,

                // Lockout settings from DTO
                UserLockOutEnabled = dto.IsLockoutEnabled,
                DefaultAccountLockoutSeconds = dto.DefaultAccountLockoutSeconds,
                MaxFailedAccessAttemptsBeforeLockout = dto.MaxFailedAccessAttemptsBeforeLockout,

                // Password complexity from DTO
                RequireDigit = dto.RequireDigit,
                RequireLowercase = dto.RequireLowercase,
                RequireNonAlphanumeric = dto.RequireNonAlphanumeric,
                RequireUppercase = dto.RequireUppercase,
                RequiredLength = dto.RequiredLength,

                // Password reset settings from DTO
                UseResetPasswordViaEmailLink = dto.ResetPasswordWithEmailLinkIsSupported,
                ResetPasswordEmailLinkLifetime = dto.ResetPasswordWithEmailLinkExpiryDelay,
                UseResetPasswordViaSmsOtp = dto.ResetPasswordWithSmsOtpIsSupported,
                ResetPasswordSmsOtpLifetime = dto.ResetPasswordWithSmsOtpExpiryDelay,
                UseResetPasswordViaSecurityQuestions = dto.ResetPasswordWithSecurityQuestionsIsSupported,
                ResetPasswordViaSecurityQuestionsNumQuestionsAllowed = dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed
            });

            // General Frontend Security Settings
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