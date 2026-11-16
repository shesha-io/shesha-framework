using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Otp.Dto
{
    public class SendPinInput : ISendPinInput
    {
        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent.
        /// Optional when the recipient is a person or user (see <see cref="RecipientType"/>): addresses are then taken from the person
        /// </summary>
        public string SendTo { get; set; }

        /// <summary>
        /// Kind of address passed in <see cref="SendTo"/> (Sms = 1, Email = 2, EmailLink = 4).
        /// Also selects the default OTP configuration when <see cref="OtpConfig"/> is not specified
        /// </summary>
        [Required]
        public OtpSendType SendType { get; set; }

        /// <summary>
        /// Type of the recipient. When it is a person or a user (entity class name or type short alias) and <see cref="RecipientId"/> is its id,
        /// the OTP can be delivered over every channel of the notification type using the addresses of that person
        /// </summary>
        public string? RecipientType { get; set; }

        /// <summary>
        /// Id of the recipient. Available in the notification templates as <c>{{userid}}</c>
        /// </summary>
        public string? RecipientId { get; set; }

        /// <summary>
        /// Lifetime of the one time password in seconds. Overrides the lifetime of the OTP configuration
        /// </summary>
        public Int64? Lifetime { get; set; }

        /// <summary>
        /// Type of action (e.g. 'password restore'). Is used for audit purposes
        /// </summary>
        public string? ActionType { get; set; }

        /// <summary>
        /// OTP configuration of the action protected by the OTP. Defines how the pin is generated and which notification (templates and channels) delivers it.
        /// When empty, the default configuration of the <see cref="SendType"/> is used
        /// </summary>
        public OtpConfigIdentifierDto? OtpConfig { get; set; }

        /// <summary>
        /// Entity that originated the OTP request
        /// </summary>
        public GenericEntityReference? Owner { get; set; }
    }
}
