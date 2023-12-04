using Abp.Domain.Entities;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Organisation")]
    public class Organisation : OrganisationBase<Organisation, Address, Person>
    {
    }
}