using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.DummyCountryData")]
    public class DummyCountryData : FullAuditedEntity<Guid>
    {
        [MaxLength(100)]
        [Required]
        [EntityDisplayName]
        public virtual string City { get; set; }

        [MaxLength(100)]
        [Required]
        public virtual string Country { get; set; }

        [Display(Name = "Population (M)", Description = "Population in millions")]
        public virtual decimal? Population { get; set; }

        [Display(Name = "Area (km²)", Description = "Area in square kilometers")]
        public virtual decimal? Area { get; set; }

        [MaxLength(1000)]
        [Display(Name = "Fun Fact")]
        public virtual string FunFact { get; set; }
    }
}