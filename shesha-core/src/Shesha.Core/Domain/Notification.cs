using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Notification")]
    public class Notification : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual string Name { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual NotificationTypeConfig NotificationType { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual Person? ToPerson { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual Person? FromPerson { get; set; }
        /// <summary>
        /// Serialized Json of the notification data
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string NotificationData { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual RefListNotificationPriority Priority { get; set; }
        /// <summary>
        /// The entity that the notification pertains to
        /// </summary>
        public virtual GenericEntityReference? TriggeringEntity { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual NotificationTopic NotificationTopic { get; set; }

        /// <summary>
        /// Notification category (any string reference that can be used for analysys)
        /// </summary>
        public string Category { get; set; } = string.Empty;
    }
}
