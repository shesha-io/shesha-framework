using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationTemplate")]
    public class NotificationTemplate : FullAuditedEntity<Guid>
    {
        public virtual bool IsEnabled { get; set; }

        [StringLength(300)]
        public virtual string Name { get; set; }

        public virtual Notification Notification { get; set; }

        [StringLength(int.MaxValue)]
        public virtual string Body { get; set; }

        [StringLength(300)]
        public virtual string Subject { get; set; }
        public virtual RefListNotificationType? SendType { get; set; }
        public virtual RefListNotificationTemplateType? BodyFormat { get; set; }

        public NotificationTemplate()
        {
            IsEnabled = true;
        }
    }
}
