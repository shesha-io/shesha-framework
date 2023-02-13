using System;
using Shesha.Domain.Enums;

namespace Shesha.Otp.Dto
{
    public class OtpDto
    {
        public Guid OperationId { get; set; }
        public string Pin { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? ExpiresOn { get; set; }

        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        public string SendTo { get; set; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        public OtpSendType SendType { get; set; }

        public string RecipientType { get; set; }
        public string RecipientId { get; set; }
        /// <summary>
        /// Type of action (e.g. 'password restore'). May be used for audit purposes and template selection
        /// </summary>
        public string ActionType { get; set; }

        public DateTime? SentOn { get; set; }

        public OtpSendStatus SendStatus { get; set; }

        public string ErrorMessage { get; set; }
    }
}
