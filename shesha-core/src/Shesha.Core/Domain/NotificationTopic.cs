using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationTopic", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class NotificationTopic: FullAuditedEntity<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
    }
}
