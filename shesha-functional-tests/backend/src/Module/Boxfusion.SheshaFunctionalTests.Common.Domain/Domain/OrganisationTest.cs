using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.EntityHistory;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class OrganisationTest : Organisation
    {
        [CascadeUpdateRules(true, true)]
        public override Address PrimaryAddress { get => base.PrimaryAddress; set => base.PrimaryAddress = value; }

        [ManyToMany(true)]
        [AuditedAsManyToMany]
        public virtual IList<Person> DirectPersons { get; set; } = new List<Person>();
    }
}
