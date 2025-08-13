using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.EntityHistory;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /*
    public class OrganisationTest : Organisation
    {
        [CascadeUpdateRules(true, true)]
        public override Address PrimaryAddress { get => base.PrimaryAddress; set => base.PrimaryAddress = value; }

        [ManyToMany(true)]
        [AuditedAsManyToMany]
        public virtual IList<Person> DirectPersons { get; set; } = new List<Person>();
    }
    */

    /* AS: Experiments for using one table for linking two entities with several list properties with the same entity types
    [Table("ShaAutoGen_OrganisationTest_DirectPersons_Reference")]
    public class OrganisationTestDirectPersons : Entity<Guid>
    {
        public Guid OrganisationTestId { get; set; }

        public Guid PersonId { get; set; }

        //public string PropertyName { get; set; }
    }
    */
}
