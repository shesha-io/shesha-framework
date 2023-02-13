using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Facility")]
    [Discriminator]
    public class Facility : FullAuditedEntity<Guid>
    {
        [StringLength(100, MinimumLength = 2)]
        [EntityDisplayName, Required]
        public virtual string Name { get; set; }

        [StringLength(300)]
        [DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }

        [ReferenceList("Shesha.Core", "FacilityType")]
        public virtual int? FacilityType { get; set; }

        public virtual Address Address { get; set; }

        public virtual Person PrimaryContact { get; set; }

        public virtual Organisation OwnerOrganisation { get; set; }

        public virtual decimal Latitude { get; set; }

        public virtual decimal Longitude { get; set; }

        public virtual decimal Altitude { get; set; }

        public virtual Facility PartOf { get; set; }
    }
}
