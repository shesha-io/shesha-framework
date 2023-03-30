using Abp.Domain.Entities.Auditing;
using System;

namespace Shesha.Domain
{
    public class Account : FullAuditedEntity<Guid>
    {
        public virtual string Name { get; set; }

        public virtual Person PrimaryContact{ get; set; }

        public virtual Organisation Organisation { get; set; }

        public virtual Account Parent { get; set; }

        public virtual Site PrimarySite { get; set; }
    }
}
