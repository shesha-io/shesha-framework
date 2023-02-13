using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class OtpAuditItem: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        [StringLength(200)]
        public virtual string SendTo { get; set; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        public virtual OtpSendType SendType { get; set; }

        [StringLength(100)]
        public virtual string RecipientType { get; set; }
        
        [StringLength(40)]
        public virtual string RecipientId { get; set; }

        /// <summary>
        /// Expiration date
        /// </summary>
        public virtual DateTime? ExpiresOn { get; set; }

        /// <summary>
        /// Sent On
        /// </summary>
        public virtual DateTime? SentOn { get; set; }

        [StringLength(100)]
        public virtual string Otp { get; set; }
        
        [StringLength(100)]
        public virtual string ActionType { get; set; }

        public virtual OtpSendStatus SendStatus { get; set; }
        
        [StringLength(int.MaxValue)]
        public virtual string ErrorMessage { get; set; }
    }
}
