using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Notifications;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;

namespace Shesha.Domain
{
    public class NotificationMessage : FullAuditedEntityWithExternalSync<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// Person who sent this message
        /// </summary>
        public virtual Person Sender { get; set; }
        
        /// <summary>
        /// Recipient (person) of the message
        /// </summary>
        public virtual Person Recipient { get; set; }

        /// <summary>
        /// Send type (email/sms/push etc)
        /// </summary>
        public virtual RefListNotificationType SendType { get; set; }

        /// <summary>
        /// Recipient text (email address/mobile number etc)
        /// </summary>
        [StringLength(300)]
        public virtual string RecipientText { get; set; }
        /// <summary>
        /// Sender text (email address/mobile number etc)
        /// </summary>
        [StringLength(300)]
        public virtual string SenderText { get; set; }

        /// <summary>
        /// Subject of the message
        /// </summary>
        [StringLength(300)]
        public virtual string Subject { get; set; }

        /// <summary>
        /// Message body
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string Body { get; set; }

        /// <summary>
        /// Template that was used for message generation
        /// </summary>
        public virtual NotificationTemplate Template { get; set; }

        /// <summary>
        /// Notification
        /// </summary>
        public virtual Notification Notification { get; set; }
        
        /// <summary>
        /// Source or Owner Entity 
        /// </summary>
        public virtual GenericEntityReference SourceEntity { get; set; }

        /// <summary>
        /// Date and time of last attempt to send the message
        /// </summary>
        public virtual DateTime? SendDate { get; set; }

        /// <summary>
        /// Number of attempt to send the message
        /// </summary>
        public virtual int TryCount { get; set; }

        /// <summary>
        /// Status (outgoing/sent/failed etc)
        /// </summary>
        public virtual RefListNotificationStatus Status { get; set; }

        /// <summary>
        /// Direction (outgoing/incoming)
        /// </summary>
        public virtual RefListNotificationDirection Direction { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        public virtual string ErrorMessage { get; set; }

        /// <summary>
        /// CC emails
        /// </summary>
        public virtual string Cc { get; set; }

        public NotificationMessage()
        {
            TryCount = 0;
            Status = RefListNotificationStatus.Unknown;
        }

        public virtual int? TenantId { get; set; }
        public virtual TenantNotificationInfo TenantNotification { get; set; }
        /// <summary>
        /// Indicates whether or not a user has viewed the notificationMessage,
        /// </summary>
        public virtual bool? Opened { get; set; }
        /// <summary>
        /// The Date and time the user last viewed the notificationMessage
        /// </summary>
        public virtual DateTime? LastOpened { get; set; }
    }
}
