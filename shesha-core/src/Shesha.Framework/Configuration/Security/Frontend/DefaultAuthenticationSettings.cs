using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;

namespace Shesha.Configuration.Security.Frontend
{
    public class DefaultAuthenticationSettings
    {
        /// <summary>
        /// Require OTP Verification on registration
        /// </summary>
        [Display(Name = "Require OTP Verification")]
        public bool RequireOtpVerification { get; set; }

        /// <summary>
        /// Specifies if local/DB authentication is enabled for the frontend.
        /// </summary>
        [Display(Name = "Allow authentication with local username and password")]
        [Description("Specifies if local/DB authentication is enabled for the frontend.")]
        public bool AllowLocalUsernamePasswordAuth { get; set; }

        /// <summary>
        /// Specifies whether to use default registration form. If false, a custom registration form and process must be implemented.
        /// </summary>
        [Display(Name = "Use default registration form")]
        [Description("Specifies whether to use default registration form. If false, a custom registration form and process must be implemented.")]
        public bool UseDefaultRegistrationForm { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [Display(Name = "Use email as username")]
        public bool UserEmailAsUsername { get; set; }

        /// <summary>
        /// The form the user will be redirected to when clicking 'Register' link from the login page.
        /// </summary>
        [Display(Name = "Custom registration form")]
        [Description("The form the user will be redirected to when clicking 'Register' link from the login page.")]
        public GenericEntityReference? CustomRegistrationForm { get; set; }

        public SupportedRegistrationMethods? SupportedVerificationMethods { get; set; }

        #region Password Complexity
        /// <summary>
        /// Require digit
        /// </summary>
        [Display(Name = "Require digit")]
        public bool RequireDigit { get; set; }

        /// <summary>
        /// Require lowercase
        /// </summary>
        [Display(Name = "Require lowercase")]
        public bool RequireLowercase { get; set; }

        /// <summary>
        /// Require non alphanumeric
        /// </summary>
        [Display(Name = "Require non alphanumeric")]
        public bool RequireNonAlphanumeric { get; set; }

        /// <summary>
        /// Require upper case
        /// </summary>
        [Display(Name = "Require upper case")]
        public bool RequireUppercase { get; set; }

        /// <summary>
        /// Require length
        /// </summary>
        [Display(Name = "Require length")]
        public int RequiredLength { get; set; }
        #endregion

        #region User Lockout
        /// <summary>
        /// Is user lockout enabled
        /// </summary>
        [Display(Name = "Is user lockout enabled")]
        public bool UserLockOutEnabled { get; set; }

        /// <summary>
        /// Max failed login attempts before lockout
        /// </summary>
        [Display(Name = "Max failed login attempts before lockout")]
        public int MaxFailedAccessAttemptsBeforeLockout { get; set; }

        /// <summary>
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "User lockout (sec)")]
        public int DefaultAccountLockoutSeconds { get; set; }
        #endregion

        #region One-Time-Pins
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
        /// Subject template
        /// </summary>
        public string DefaultSubjectTemplate { get; set; }

        /// <summary>
        /// Body template
        /// </summary>
        public string DefaultBodyTemplate { get; set; }

        /// <summary>
        /// Email link subject template
        /// </summary>
        public string DefaultEmailSubjectTemplate { get; set; }

        /// <summary>
        /// Email link body template
        /// </summary>
        public string DefaultEmailBodyTemplate { get; set; }
        #endregion

        #region Password Reset
        /// <summary>
        /// Use reset password via email
        /// </summary>
        public bool UseResetPasswordViaEmailLink { get; set; }

        /// <summary>
        /// Email link lifetime
        /// </summary>
        public int ResetPasswordEmailLinkLifetime { get; set; }

        /// <summary>
        /// Use reset password via sms
        /// </summary>
        public bool UseResetPasswordViaSmsOtp { get; set; }

        /// <summary>
        /// OTP lifetime
        /// </summary>
        public int ResetPasswordSmsOtpLifetime { get; set; }

        /// <summary>
        /// Use reset password via security questions
        /// </summary>
        public bool UseResetPasswordViaSecurityQuestions { get; set; }

        /// <summary>
        /// Num questions allowed
        /// </summary>
        public int ResetPasswordViaSecurityQuestionsNumQuestionsAllowed { get; set; }
        #endregion
    }
}
