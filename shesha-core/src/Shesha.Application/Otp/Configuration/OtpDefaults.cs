namespace Shesha.Otp.Configuration
{
    /// <summary>
    /// OTP Defaults
    /// </summary>
    public static class OtpDefaults
    {
        public const int DefaultPasswordLength = 6;
        public const string DefaultAlphabet = "0123456789";
        public const int DefaultLifetime = 3 * 60;
        public const string DefaultSubjectTemplate = "One-Time-Pin";
        public const string DefaultBodyTemplate = "Your One-Time-Pin is {{password}}";
        public const string DefaultEmailSubjectTemplate = "One-Time-Pin";
        public const string DefaultEmailBodyTemplate = @"Your One-Time-Pin is {{password}}";
    }
}
