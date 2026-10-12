using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.UserTopicSubscription", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class UserTopicSubscription: FullAuditedEntity<Guid>
    {
        public virtual Person User { get; set; }
        public virtual NotificationTopic Topic { get; set; }
    }
}
