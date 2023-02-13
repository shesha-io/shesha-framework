using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointedUnit", FriendlyName = "Appointed Unit")]
    [DiscriminatorValue((int)ShaRoleAppointmentType.Unit)]
    public class ShaRoleAppointedUnit : ShaRoleAppointment
    {
        public virtual OrganisationUnit OrganisationUnit { get; set; }
    }
}