using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Table("Test_DynamicPersons")]
    [Discriminator]
    //[DiscriminatorValue("DynamicPersons")]
    public class DynamicPerson : Entity<Guid>
    {
        [EntityDisplayName]
        public virtual string? FirstName { get; set; }

        public virtual string? LastName { get; set; }

        public virtual DateTime? BirthDate { get; set; }

        public virtual int? Age { get; set; }

        public virtual DynamicPerson? TestParent { get; set; }
    }
}
