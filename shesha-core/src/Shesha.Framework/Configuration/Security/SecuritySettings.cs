using Shesha.Domain.Enums;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration.Security
{
    public class SecuritySettings
    {
        /// <summary>
        /// Auto logoff timeout
        /// </summary>
        public int AutoLogoffTimeout { get; set; }

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
        /// OTP lifetime
        /// </summary>
        public int MobileLoginPinLifetime { get; set; }

        /// <summary>
        /// Use reset password via security questions
        /// </summary>
        public bool UseResetPasswordViaSecurityQuestions { get; set; }

        /// <summary>
        /// Num questions allowed
        /// </summary>
        public int ResetPasswordViaSecurityQuestionsNumQuestionsAllowed { get; set; }

        /// <summary>
        /// Default endpoint access
        /// </summary>
        [Display(Name = "Default endpoint access", Description = "Used for 'Inherited' endpoint access")]
        public RefListPermissionedAccess DefaultEndpointAccess { get; set; }

    }
}
