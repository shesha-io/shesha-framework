using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.UserNotificationPreference", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class UserNotificationPreference: FullAuditedEntity<Guid>
    {
        public virtual Person User { get; set; }
        public virtual NotificationTypeConfig NotificationType { get; set; }
        public virtual bool OptOut { get; set; }
        public virtual NotificationChannelConfig DefaultChannel { get; set; }
    }
}
