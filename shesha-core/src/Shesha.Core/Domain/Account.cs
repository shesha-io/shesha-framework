using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

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
		[MaxLength(50)]
		public virtual string ContactEmail { get; set; }
		[MaxLength(50)]
		public virtual string ContactTelephone { get; set; }
		[MaxLength(400)]
		public virtual string FreeTextBillingAddress { get; set; }
		public virtual Address BillingAddress { get; set; }

	}
}
