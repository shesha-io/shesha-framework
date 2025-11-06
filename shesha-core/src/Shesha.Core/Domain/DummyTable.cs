using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.DummyTable")]
    [Table("Core_DummyTable")]
    public class DummyTable : FullPowerEntity
    {
        [MaxLength(100)]
        [Display(Name = "City")]
        public virtual string City { get; set; }

        [MaxLength(100)]
        [Display(Name = "Country")]
        public virtual string Country { get; set; }

        [Display(Name = "Population (M)")]
        [Column(TypeName = "decimal(18,2)")]
        public virtual decimal Population { get; set; }

        [Display(Name = "Area (km²)")]
        public virtual int Area { get; set; }

        [MaxLength(500)]
        [Display(Name = "Fun Fact")]
        public virtual string FunFact { get; set; }

        public override string ToString()
        {
            return City ?? base.ToString();
        }
    }
}