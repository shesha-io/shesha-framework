using System;

namespace Shesha.Otp.Configuration
{
    public class OtpSettings
    {
        /// <summary>
        /// Length of the OTP
        /// </summary>
        public int PasswordLength { get; set; }

        /// <summary>
        /// Alphabet which is used for OTP generation. For example `abcde` or `1234567890`
        /// </summary>
        public string Alphabet { get; set; }

        /// <summary>
        /// Default lifetime of the password in seconds
        /// </summary>
        public int DefaultLifetime { get; set; }

        /// <summary>
        /// Ignore validation of the OTP. If true, OTP service doesn't send OTP and skip it's validation but other functions works as usual.
        /// Note: just for testing purposes
        /// </summary>
        public bool IgnoreOtpValidation { get; set; }

        /// <summary>
        /// Indicates that customised OTP templates were migrated into the notification templates of the OTP configurations
        /// </summary>
        public bool LegacyTemplatesMigrated { get; set; }

        /// <summary>
        /// Subject template
        /// </summary>
        [Obsolete("No longer used: OTP messages are sent using the notification templates of the OTP configuration (OtpConfig). Customised values are migrated into those templates once.")]
        public string DefaultSubjectTemplate { get; set; }

        /// <summary>
        /// Body template
        /// </summary>
        [Obsolete("No longer used: OTP messages are sent using the notification templates of the OTP configuration (OtpConfig). Customised values are migrated into those templates once.")]
        public string DefaultBodyTemplate { get; set; }

        /// <summary>
        /// Email link subject template
        /// </summary>
        [Obsolete("No longer used: OTP messages are sent using the notification templates of the OTP configuration (OtpConfig). Customised values are migrated into those templates once.")]
        public string DefaultEmailSubjectTemplate { get; set; }

        /// <summary>
        /// Email link body template
        /// </summary>
        [Obsolete("No longer used: OTP messages are sent using the notification templates of the OTP configuration (OtpConfig). Customised values are migrated into those templates once.")]
        public string DefaultEmailBodyTemplate { get; set; }
    }
}
