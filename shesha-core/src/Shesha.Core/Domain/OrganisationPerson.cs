using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Discriminator(UseDiscriminator = true)]
    public class OrganisationPersonBase<TOrganisation, TPerson> : RelationshipEntityBase<Guid> where TOrganisation: OrganisationBase where TPerson : Person
    {
        public virtual Boolean IsPrimary { get; set; }

        [StringLength(300)]
        public virtual string Description { get; set; }

        [AllowInherited]
        [Required]
        public virtual TOrganisation Organisation { get; set; }

        [AllowInherited]
        [Required]
        public virtual TPerson Person { get; set; }
    }

    [Entity(TypeShortAlias = "Shesha.Core.OrganisationPerson")]
    [DiscriminatorValue("Shesha.Core.OrganisationPerson")]
    [Table("Core_OrganisationPersons")]
    public class OrganisationPerson : OrganisationPersonBase<Organisation, Person>
    {
        [ReferenceList("Shesha.Core", "OrganisationPersonRole")]
        public override int? Role { get; set; }
    }
}
