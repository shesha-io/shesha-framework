using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.UserTopicSubscription")]
    public class UserTopicSubscription: FullAuditedEntity<Guid>
    {
        public virtual Person User { get; set; }
        public virtual NotificationTopic Topic { get; set; }
    }
}
