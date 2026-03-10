using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Table("otp_audit_items", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class OtpAuditItem: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP should be sent
        /// </summary>
        [MaxLength(200)]
        public virtual string SendTo { get; set; }

        /// <summary>
        /// Type of sender (Sms = 1, Email = 2)
        /// </summary>
        public virtual OtpSendType SendType { get; set; }

        [MaxLength(100)]
        public virtual string? RecipientType { get; set; }
        
        [MaxLength(100)]
        public virtual string? RecipientId { get; set; }

        /// <summary>
        /// Expiration date
        /// </summary>
        public virtual DateTime? ExpiresOn { get; set; }

        /// <summary>
        /// Sent On
        /// </summary>
        public virtual DateTime? SentOn { get; set; }

        [MaxLength(100)]
        public virtual string Otp { get; set; }
        
        [MaxLength(100)]
        public virtual string? ActionType { get; set; }

        public virtual OtpSendStatus SendStatus { get; set; }
        
        [MaxLength(int.MaxValue)]
        public virtual string? ErrorMessage { get; set; }
    }
}
