using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// A one-time pin sent (or resent) to a destination. Used to limit how often pins are sent to the same mobile number or
    /// email address. It's kept in the database so that the limits are shared by all instances of the application
    /// </summary>
    [SnakeCaseNaming]
    [Table("otp_send_log_items", Schema = "frwk")]
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class OtpSendLogItem : Entity<Guid>
    {
        /// <summary>
        /// Normalized destination, e.g. <c>sms:0821234567</c> or <c>email:user@example.com</c>
        /// </summary>
        [MaxLength(300)]
        public virtual string Destination { get; set; }

        /// <summary>
        /// When the pin was sent (UTC)
        /// </summary>
        public virtual DateTime SentOnUtc { get; set; }

        /// <summary>
        /// Until when the send limits need this send (UTC): the send time plus the longer of an hour and the OTP cooldown that
        /// applied when it was sent. The cleanup job removes it after that
        /// </summary>
        public virtual DateTime KeepUntilUtc { get; set; }
    }
}
