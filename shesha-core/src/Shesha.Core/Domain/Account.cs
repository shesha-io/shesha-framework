using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain
{
    [Discriminator]
    public class Account : FullAuditedEntity<Guid>
    {
        public virtual string Name { get; set; }

        public virtual Person PrimaryContact { get; set; }

        public virtual Organisation Organisation { get; set; }

        public virtual Account Parent { get; set; }

        public virtual Site PrimarySite { get; set; }

        public virtual string AccountNo { get; set; }
        [ReferenceList("Shesha.Core", "AccountStatus")]
        public virtual RefListAccountStatus? Status { get; set; }
        [ReferenceList("Shesha.Core", "AccountType")]
        public virtual RefListAccountType? AccountType { get; set; }
        public virtual DateTime? ActiveFromDate { get; set; }
        public virtual DateTime? ActiveToDate { get; set; }

    }
}
