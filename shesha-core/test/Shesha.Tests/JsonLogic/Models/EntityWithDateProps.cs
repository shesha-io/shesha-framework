using Abp.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Tests.JsonLogic.Models
{
    public class EntityWithDateProps : Entity<Guid>
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
    }
}
