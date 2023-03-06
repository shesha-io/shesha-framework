using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.EmployeeAccount")]
    public class EmployeeAccount: Entity<Guid>
    {
        public virtual Employee Employee { get; set; }

        public virtual Account Account { get; set; }
    }
}
