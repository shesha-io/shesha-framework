using Abp.Domain.Entities;
using System;

namespace Shesha.Tests.JsonLogic.Models
{
    public class EntityWithNumericProp<TProp> : Entity<Guid>
    {
        public virtual TProp NotNullableNumeric { get; set; }
    }
}
