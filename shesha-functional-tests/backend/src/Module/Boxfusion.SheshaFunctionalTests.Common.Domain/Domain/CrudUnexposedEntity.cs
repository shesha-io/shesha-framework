using Abp.Domain.Entities;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    /// Test entity without an exposure attribute, must get no CRUD endpoints (#5568)
    /// </summary>
    public class CrudUnexposedEntity : Entity<Guid>
    {
        public virtual string Name { get; set; }
    }
}
