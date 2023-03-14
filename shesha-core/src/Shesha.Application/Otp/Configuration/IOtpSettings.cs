using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Otp.Configuration
{
    /// <summary>
    /// One time pin Settings
    /// </summary>
    [Category("One Time Pins")]
    public interface IOtpSettings: ISettingAccessors
    {
        /// <summary>
        /// Length of the OTP
        /// </summary>
        [Display(Name = "Password length")]
        [Setting(OtpSettingsNames.PasswordLength)]
        ISettingAccessor<int> PasswordLength { get; }

        /// <summary>
        /// Alphabet which is used for OTP generation. For example `abcde` or `1234567890`
        /// </summary>
        [Display(Name = "Alphabet")]
        [Setting(OtpSettingsNames.Alphabet)]
        ISettingAccessor<string> Alphabet { get; }

        /// <summary>
        /// Default lifetime of the password in seconds
        /// </summary>
        [Display(Name = "Pin lifetime", Description = "Default lifetime of the password in seconds")]
        [Setting(OtpSettingsNames.DefaultLifetime)]
        ISettingAccessor<int> DefaultLifetime { get; }

        /// <summary>
        /// Ignore validation of the OTP. If true, OTP service doesn't send OTP and skip it's validation but other functions works as usual.
        /// Note: just for testing purposes
        /// </summary>
        [Display(Name = "Ignore OTP validation", Description = "Ignore validation of the OTP. If true, OTP service doesn't send OTP and skip it's validation but other functions works as usual.")]
        [Setting(OtpSettingsNames.IgnoreOtpValidation)]
        ISettingAccessor<bool> IgnoreOtpValidation { get; }

        /// <summary>
        /// Subject template
        /// </summary>
        [Display(Name = "Subject template")]
        [Setting(OtpSettingsNames.DefaultSubjectTemplate)]
        ISettingAccessor<string> DefaultSubjectTemplate { get; }

        /// <summary>
        /// Body template
        /// </summary>
        [Display(Name = "Body template")]
        [Setting(OtpSettingsNames.DefaultBodyTemplate)]
        ISettingAccessor<string> DefaultBodyTemplate { get; }

        /// <summary>
        /// Email link subject template
        /// </summary>
        [Display(Name = "Email link subject template")]
        [Setting(OtpSettingsNames.DefaultEmailSubjectTemplate)]
        ISettingAccessor<string> DefaultEmailSubjectTemplate { get; }

        /// <summary>
        /// Email link body template
        /// </summary>
        [Display(Name = "Email link body template")]
        [Setting(OtpSettingsNames.DefaultEmailBodyTemplate)]
        ISettingAccessor<string> DefaultEmailBodyTemplate { get; }
    }
}
