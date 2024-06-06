using Abp.Auditing;
using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Bank")]
    public class Bank: Entity<Guid>
    {
        [Audited]
        public virtual string Name { get; set; }
        [Audited]
        public virtual string Description { get; set; }
        public virtual Address Address { get; set; }
    }
}
