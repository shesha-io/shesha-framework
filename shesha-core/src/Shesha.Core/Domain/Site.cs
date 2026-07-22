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
    [Discriminator]
    public class Site : FullAuditedEntity<Guid>
    {
        public virtual string Name { get; set; }
        public virtual TimeSpan? OperatingHoursStartTime { get; set; } // Property to store the opening time  of a facility
        public virtual TimeSpan? OperatingHoursClosingTime { get; set; }// Property to store the closing time  of a facility

        public virtual string ShortName { get; set; }

        public virtual string Description { get; set; }

        public virtual string Comments { get; set; }

        public virtual Site PartOf { get; set; }

        public virtual int? TenantId { get; set; }

        [ReferenceList("Shesha.Core", "SiteType")]
        public virtual long? SiteType { get; set; }

        public virtual Address Address { get; set; }

        public virtual Person PrimaryContact { get; set; }

        public virtual Organisation Organisation { get; set; }

        public virtual decimal? Latitude { get; set; }

        public virtual decimal? Longitude { get; set; }

        public virtual decimal? Altitude { get; set; }
        public virtual RefListSiteSubType? SiteSubType { get; set; }

        public virtual int? Area { get; set; }

		[MaxLength(20)]
		public virtual string ContactNumber { get; set; }
    }
}
