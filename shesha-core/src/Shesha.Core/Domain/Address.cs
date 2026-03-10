using System;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [DiscriminatorValue("Shesha.Core.Address")]
    [Discriminator]
    [Entity(TypeShortAlias = "Shesha.Core.Address")]
    public class Address: FullAuditedEntity<Guid>, IMayHaveTenant
    {
        [ReferenceList("Shesha.Core", "AddressType")]
        public virtual int? AddressType { get; set; }


        [MaxLength(200)]
        [EntityDisplayNameAttribute]
        [Required]
        public virtual string AddressLine1 { get; set; }

        [MaxLength(200)]
        public virtual string AddressLine2 { get; set; }

        [MaxLength(200)]
        public virtual string AddressLine3 { get; set; }

        [MaxLength(100)]
        public virtual string Suburb { get; set; }

        [MaxLength(100)]
        public virtual string Town { get; set; }

        [MaxLength(10)]
        public virtual string POBox { get; set; }

        [Range(-90, 90, ErrorMessage = "Latitude should be in range (-90, 90)")]
        public virtual decimal? Latitude { get; set; }

        [Range(-90, 90, ErrorMessage = "Longitude should be in range (-90, 90)")]
        public virtual decimal? Longitude { get; set; }

        //[EntityDisplayName] 
        [ReadonlyProperty]
        public virtual string FullAddress { get; set; }

        public virtual int? TenantId { get; set; }
    }
}
