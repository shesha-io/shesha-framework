using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;

namespace Shesha.Tests.DomainAttributes
{
    public class PersonEntity: Entity<Guid>
    {
        public virtual string Name { get; set; }

        [SaveAsJson]
        public virtual Address HomeAddress { get; set; }

        [SaveAsJson]
        public virtual Address OfficeAddress { get; set; }

    }
}
