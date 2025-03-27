using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Tests.JsonLogic.Models
{
    [NotMapped]
    public class PersonWithCustomProps : Person
    {
        public virtual DateTime? NullableDateTimeProp { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime? NullableDateProp { get; set; }

        public virtual TimeSpan? NullableTimeProp { get; set; }

        public virtual DateTime DateTimeProp { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTime DateProp { get; set; }

        public virtual TimeSpan TimeProp { get; set; }
        public virtual int IntProp { get; set; }
        public virtual int? NullableIntProp { get; set; }

        public virtual RefListPersonTitle CustomTitle { get; set; }
    }
}
