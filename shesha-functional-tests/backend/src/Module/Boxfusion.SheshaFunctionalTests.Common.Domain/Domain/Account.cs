using Abp.Domain.Entities;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.TestAccount")]
    public class TestAccount: Entity<Guid>
    {
        public virtual string AccountNumber { get; set; }

        [ReferenceList("Boxfusion.SheshaFunctionalTests.Domain.Enum", "AccType")]
        public virtual RefListAccType? AccountType { get; set; }

        public virtual Bank Bank { get; set; }
        public virtual FormConfiguration CaptureForm { get; set; }
    }
}
