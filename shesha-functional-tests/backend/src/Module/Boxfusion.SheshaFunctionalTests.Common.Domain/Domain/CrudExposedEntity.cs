using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    /// Test entity that opts in to CRUD endpoints (#5568)
    /// </summary>
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.CrudExposedEntity", CrudActions = CrudActions.All)]
    public class CrudExposedEntity : Entity<Guid>
    {
        public virtual string Name { get; set; }
    }
}
