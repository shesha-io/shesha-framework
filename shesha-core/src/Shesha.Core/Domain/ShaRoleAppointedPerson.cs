using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointedPerson", FriendlyName = "Appointed Person")]
    [DiscriminatorValue((int)ShaRoleAppointmentType.Person)]
    public class ShaRoleAppointedPerson : ShaRoleAppointment
    {
        public virtual Person Person { get; set; }
    }
}