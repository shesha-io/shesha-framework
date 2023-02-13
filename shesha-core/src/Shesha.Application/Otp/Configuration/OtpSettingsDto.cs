namespace Shesha.Otp.Configuration
{
    /// <summary>
    /// Represents settings of the OTP service
    /// </summary>
    public class OtpSettingsDto
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
        /// Subject for the email when the email link is sent to the recipient.
        /// TODO: Find a better place to place these
        /// </summary>
        public string EmailSubject { get; set; }

        /// <summary>
        /// Email template body
        /// </summary>
        public string EmailBodyTemplate { get; set; }
    }
}
