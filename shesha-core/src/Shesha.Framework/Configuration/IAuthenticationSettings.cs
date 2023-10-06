using Abp.Zero.Configuration;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    /// <summary>
    /// Authentication settings
    /// </summary>
    [Category("Authentication")]
    public interface IAuthenticationSettings: ISettingAccessors
    {
        /// <summary>
        /// Is user lockout enabled
        /// </summary>
        [Display(Name = "Is user lockout enabled")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled, IsClientSpecific = true)]
        ISettingAccessor<bool> UserLockOutEnabled { get; }

        /// <summary>
        /// Max failed login attempts before lockout
        /// </summary>
        [Display(Name = "Max failed login attempts before lockout")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, IsClientSpecific = true)]
        ISettingAccessor<int> MaxFailedAccessAttemptsBeforeLockout { get; }

        /// <summary>
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "User lockout (sec)")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds, IsClientSpecific = true)]
        ISettingAccessor<int> DefaultAccountLockoutSeconds { get; }

        /// <summary>
        /// Auto logoff timeout
        /// </summary>
        [Display(Name = "Auto logoff timeout")]
        [Setting(SheshaSettingNames.Security.AutoLogoffTimeout)]
        ISettingAccessor<int> AutoLogoffTimeout { get; }

        /// <summary>
        /// Use reset password via email
        /// </summary>
        [Display(Name = "Use reset password via email")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported)]
        ISettingAccessor<bool> UseResetPasswordViaEmailLink { get; }

        /// <summary>
        /// Email link lifetime
        /// </summary>
        [Display(Name = "Email link lifetime")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay)]
        ISettingAccessor<int> ResetPasswordEmailLinkLifetime { get; }

        /// <summary>
        /// Use reset password via sms
        /// </summary>
        [Display(Name = "Use reset password via sms")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported)]
        ISettingAccessor<bool> UseResetPasswordViaSmsOtp { get; }

        /// <summary>
        /// OTP lifetime
        /// </summary>
        [Display(Name = "Reset password OTP lifetime")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay)]
        ISettingAccessor<int> ResetPasswordSmsOtpLifetime { get; }

        /// <summary>
        /// OTP lifetime
        /// </summary>
        [Display(Name = "Mobile login OTP lifetime")]
        [Setting(SheshaSettingNames.Security.MobileLoginPinLifetime)]
        ISettingAccessor<int> MobileLoginPinLifetime { get; }

        /// <summary>
        /// Use reset password via security questions
        /// </summary>
        [Display(Name = "Use reset password via security questions")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported)]
        ISettingAccessor<bool> UseResetPasswordViaSecurityQuestions { get; }

        /// <summary>
        /// Num questions allowed
        /// </summary>
        [Display(Name = "Num questions allowed")]
        [Setting(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed)]
        ISettingAccessor<int> ResetPasswordViaSecurityQuestionsNumQuestionsAllowed { get; }
    }
}
