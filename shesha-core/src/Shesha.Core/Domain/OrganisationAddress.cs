using System;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.OrganisationAddress")]
    public class OrganisationAddress : RelationshipEntityBase<Guid>
    {
        [Required]
        public virtual Address Address { get; set; }

        [Required]
        public virtual Organisation Organisation { get; set; }

        [ReferenceList("Shesha.Core", "OrganisationAddressRole")]
        public override int? Role { get; set; }

    }
}
