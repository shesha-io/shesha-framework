using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationTemplate")]
    public class NotificationTemplate : FullAuditedEntity<Guid>
    {
        public virtual RefListNotificationMessageFormat? MessageFormat { get; set; }
        public virtual NotificationTypeConfig PartOf { get; set; }
        [StringLength(2000)]
        public virtual string TitleTemplate { get; set; }
        [StringLength(int.MaxValue)]
        public virtual string BodyTemplate { get; set; }
    }
}
