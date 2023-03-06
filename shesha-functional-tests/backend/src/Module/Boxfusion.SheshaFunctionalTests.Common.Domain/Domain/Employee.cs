using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Employee")]
    public class Employee : Entity<Guid>
    {
        public virtual Organisation Company { get; set; }

        public virtual string FirstName { get; set; }

        public virtual string LastName { get; set; }
    }
}
