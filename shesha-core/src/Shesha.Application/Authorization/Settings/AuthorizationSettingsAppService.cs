using Abp.Application.Services;
using Shesha.Authorization.Settings.Dto;
using Shesha.Configuration;
using System;
using System.Threading.Tasks;

namespace Shesha.Authorization.Settings
{
    [Obsolete("To be removed, is used for backward compatibility only")]
    public class AuthorizationSettingsAppService: ApplicationService
    {
        private readonly IPasswordComplexitySettings _passwordComplexitySettings;
        private readonly IAuthenticationSettings _authenticationSettings;

        public AuthorizationSettingsAppService(IPasswordComplexitySettings passwordComplexitySettings, IAuthenticationSettings authenticationSettings)
        {
            _passwordComplexitySettings = passwordComplexitySettings;
            _authenticationSettings = authenticationSettings;
        }

        public async Task UpdateSettings(AuthorizationSettingsDto dto)
        {
            //Lockout
            await _authenticationSettings.UserLockOutEnabled.SetValueAsync(dto.IsLockoutEnabled);
            await _authenticationSettings.DefaultAccountLockoutSeconds.SetValueAsync(dto.DefaultAccountLockoutSeconds);
            await _authenticationSettings.MaxFailedAccessAttemptsBeforeLockout.SetValueAsync(dto.MaxFailedAccessAttemptsBeforeLockout);
            await _authenticationSettings.AutoLogoffTimeout.SetValueAsync(dto.AutoLogoffTimeout);
            await _authenticationSettings.UserLockOutEnabled.SetValueAsync(dto.IsLockoutEnabled);

            //Password complexity
            await _passwordComplexitySettings.RequireDigit.SetValueAsync(dto.RequireDigit);
            await _passwordComplexitySettings.RequireLowercase.SetValueAsync(dto.RequireLowercase);
            await _passwordComplexitySettings.RequireNonAlphanumeric.SetValueAsync(dto.RequireNonAlphanumeric);
            await _passwordComplexitySettings.RequireUppercase.SetValueAsync(dto.RequireUppercase);
            await _passwordComplexitySettings.RequiredLength.SetValueAsync(dto.RequiredLength);

            // Password reset
            await _authenticationSettings.UseResetPasswordViaEmailLink.SetValueAsync(dto.ResetPasswordWithEmailLinkIsSupported);
            await _authenticationSettings.ResetPasswordEmailLinkLifetime.SetValueAsync(dto.ResetPasswordWithEmailLinkExpiryDelay);

            await _authenticationSettings.UseResetPasswordViaSmsOtp.SetValueAsync(dto.ResetPasswordWithSmsOtpIsSupported);
            await _authenticationSettings.ResetPasswordSmsOtpLifetime.SetValueAsync(dto.ResetPasswordWithSmsOtpExpiryDelay);

            await _authenticationSettings.UseResetPasswordViaSecurityQuestions.SetValueAsync(dto.ResetPasswordWithSecurityQuestionsIsSupported);
            await _authenticationSettings.ResetPasswordViaSecurityQuestionsNumQuestionsAllowed.SetValueAsync(dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed);
        }

        public async Task<AuthorizationSettingsDto> GetSettings()
        {
            var dto = new AuthorizationSettingsDto();
            
            //Lockout
            dto.IsLockoutEnabled = await _authenticationSettings.UserLockOutEnabled.GetValueAsync();
            dto.DefaultAccountLockoutSeconds = await _authenticationSettings.DefaultAccountLockoutSeconds.GetValueAsync();
            dto.MaxFailedAccessAttemptsBeforeLockout = await _authenticationSettings.MaxFailedAccessAttemptsBeforeLockout.GetValueAsync();
            dto.AutoLogoffTimeout = await _authenticationSettings.AutoLogoffTimeout.GetValueAsync();

            //Password complexity
            dto.RequireDigit = await _passwordComplexitySettings.RequireDigit.GetValueAsync();
            dto.RequireLowercase = await _passwordComplexitySettings.RequireLowercase.GetValueAsync();
            dto.RequireNonAlphanumeric = await _passwordComplexitySettings.RequireNonAlphanumeric.GetValueAsync();
            dto.RequireUppercase = await _passwordComplexitySettings.RequireUppercase.GetValueAsync();
            dto.RequiredLength = await _passwordComplexitySettings.RequiredLength.GetValueAsync();

            // Password reset
            dto.ResetPasswordWithEmailLinkIsSupported = await _authenticationSettings.UseResetPasswordViaEmailLink.GetValueAsync();
            dto.ResetPasswordWithEmailLinkExpiryDelay = await _authenticationSettings.ResetPasswordEmailLinkLifetime.GetValueAsync();
            dto.ResetPasswordWithSmsOtpIsSupported = await _authenticationSettings.UseResetPasswordViaSmsOtp.GetValueAsync();
            dto.ResetPasswordWithSmsOtpExpiryDelay = await _authenticationSettings.ResetPasswordSmsOtpLifetime.GetValueAsync();
            dto.ResetPasswordWithSecurityQuestionsIsSupported = await _authenticationSettings.UseResetPasswordViaSecurityQuestions.GetValueAsync();
            dto.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed = await _authenticationSettings.ResetPasswordViaSecurityQuestionsNumQuestionsAllowed.GetValueAsync();

            return dto;
        }
    }
}