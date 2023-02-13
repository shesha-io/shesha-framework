using System;
using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;

namespace Shesha.Otp.Dto
{
    public class OtpAuditItemDto: EntityDto<Guid>
    {
        /// <summary>
        /// Creation time
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP was sent
        /// </summary>
        public string SendTo { get; set; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        public ReferenceListItemValueDto SendType { get; set; }

        public string RecipientType { get; set; }

        public string RecipientId { get; set; }

        /// <summary>
        /// Expiration date
        /// </summary>
        public DateTime? ExpiresOn { get; set; }

        public string Otp { get; set; }

        public string ActionType { get; set; }

        public DateTime? SentOn { get; set; }

        public virtual ReferenceListItemValueDto SendStatus { get; set; }

        public string ErrorMessage { get; set; }
    }
}
