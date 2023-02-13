namespace Shesha.Otp.Configuration
{
    public interface IOtpSettings
    {
        /// <summary>
        /// Length of the OTP
        /// </summary>
        int PasswordLength { get; }
        
        /// <summary>
        /// Alphabet which is used for OTP generation. For example `abcde` or `1234567890`
        /// </summary>
        string Alphabet { get; }

        /// <summary>
        /// Default lifetime of the password in seconds
        /// </summary>
        int DefaultLifetime { get; }

        /// <summary>
        /// Ignore validation of the OTP. If true, OTP service doesn't send OTP and skip it's validation but other functions works as usual.
        /// Note: just for testing purposes
        /// </summary>
        bool IgnoreOtpValidation { get; }
    }
}
