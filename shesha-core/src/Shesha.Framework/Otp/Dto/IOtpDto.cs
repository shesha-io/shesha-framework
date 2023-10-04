using Shesha.Domain.Enums;
using System;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// OTP DTO
    /// </summary>
    public interface IOtpDto
    {
        Guid OperationId { get; }
        string Pin { get; }
        DateTime CreationTime { get; }
        DateTime? ExpiresOn { get; }

        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        string SendTo { get; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        OtpSendType SendType { get; }

        string RecipientType { get; }
        string RecipientId { get; }
        /// <summary>
        /// Type of action (e.g. 'password restore'). May be used for audit purposes and template selection
        /// </summary>
        string ActionType { get; }

        DateTime? SentOn { get; }

        OtpSendStatus SendStatus { get; }

        string ErrorMessage { get; }
    }
}
