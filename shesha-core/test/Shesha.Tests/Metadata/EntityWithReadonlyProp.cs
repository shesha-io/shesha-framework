using Abp.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Tests.Metadata
{
    public class EntityWithReadonlyProp : Entity<Guid>
    {
        public virtual string Name { get; set; }

        [NotMapped]
        public virtual string CalculatedReadonly => Name + " (calculated)";

        [NotMapped]
        public virtual string NotMappedReadWrite { get; set; }
    }
}
