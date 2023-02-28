using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Brand")]
    public class Brand : Entity<Guid>
    {
        public virtual string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual string WebsiteUrl { get; set; }
    }
}
