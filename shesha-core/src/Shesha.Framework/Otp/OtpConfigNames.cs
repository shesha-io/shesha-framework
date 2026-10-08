namespace Shesha.Otp
{
    /// <summary>
    /// Names of the <c>OtpConfig</c> items seeded by the framework.
    /// Each OTP-protected action has its own <c>OtpConfig</c>, which references the notification type used to
    /// deliver the pin, so administrators can configure the template and transport channel(s) per action via the
    /// standard notification editor. These names must match the items seeded by the embedded <c>.shaconfig</c> package.
    /// </summary>
    public static class OtpConfigNames
    {
        /// <summary>
        /// Module that owns the seeded OTP configs. Matches <see cref="SheshaFrameworkModule.ModuleName"/>.
        /// </summary>
        public const string Module = SheshaFrameworkModule.ModuleName;

        /// <summary>
        /// One-time pin sent when authenticating via OTP (login).
        /// </summary>
        public const string OtpLogin = "OtpLogin";

        /// <summary>
        /// One-time pin sent by SMS when resetting a password.
        /// </summary>
        public const string PasswordResetSms = "PasswordResetSms";

        /// <summary>
        /// Email link sent when resetting a password.
        /// </summary>
        public const string PasswordResetEmailLink = "PasswordResetEmailLink";

        /// <summary>
        /// Email link sent to verify an email address during registration.
        /// </summary>
        public const string EmailRegistrationLink = "EmailRegistrationLink";

        /// <summary>
        /// Default for one-time pins sent by SMS when the caller doesn't specify an OTP configuration.
        /// </summary>
        public const string OtpSms = "OtpSms";

        /// <summary>
        /// Default for one-time pins sent by email when the caller doesn't specify an OTP configuration.
        /// </summary>
        public const string OtpEmail = "OtpEmail";

        /// <summary>
        /// Default for email links when the caller doesn't specify an OTP configuration.
        /// </summary>
        public const string OtpEmailLink = "OtpEmailLink";
    }
}
