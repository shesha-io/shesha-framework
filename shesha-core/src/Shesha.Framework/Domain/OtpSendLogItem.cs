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
    [Table("Frwk_OtpSendLogItems")]
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class OtpSendLogItem : Entity<Guid>
    {
        /// <summary>
        /// Normalized destination, e.g. <c>sms:0821234567</c> or <c>email:user@example.com</c>
        /// </summary>
        [StringLength(300)]
        public virtual string Destination { get; set; }

        /// <summary>
        /// When the pin was sent (UTC)
        /// </summary>
        public virtual DateTime SentOnUtc { get; set; }
    }
}
