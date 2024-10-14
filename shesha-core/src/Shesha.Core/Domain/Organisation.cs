using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System.Collections.Generic;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Organisation")]
    public class Organisation : OrganisationBase<Organisation, Address, Person>
    {
        public virtual IList<OrganisationPerson> Persons { get; set; }
    }
}