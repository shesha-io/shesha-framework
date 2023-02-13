using System;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Enums;

namespace Shesha.Otp.Dto
{
    public class SendPinInput
    {
        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        public string SendTo { get; set; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        [Required]
        public OtpSendType SendType { get; set; }

        public string RecipientType { get; set; }
        public string RecipientId { get; set; }

        /// <summary>
        /// Lifetime of the one time password in seconds
        /// </summary>
        public Int64? Lifetime { get; set; }

        /// <summary>
        /// Type of action (e.g. 'password restore'). May be used for audit purposes and template selection
        /// </summary>
        public string ActionType { get; set; }
    }
}
