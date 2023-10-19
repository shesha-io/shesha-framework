using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// OTP sending input
    /// </summary>
    public interface ISendPinInput
    {
        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        string SendTo { get; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        [Required]
        OtpSendType SendType { get; }

        string RecipientType { get; }
        string RecipientId { get; }

        /// <summary>
        /// Lifetime of the one time password in seconds
        /// </summary>
        Int64? Lifetime { get; }

        /// <summary>
        /// Type of action (e.g. 'password restore'). May be used for audit purposes and template selection
        /// </summary>
        string ActionType { get; }
    }
}
