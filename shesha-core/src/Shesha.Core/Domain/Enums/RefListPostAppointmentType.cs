using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "PostAppointmentType")]
    public enum RefListPostAppointmentType
    {
        Permanent = 1,
        Acting = 2,
        Contract = 3
    }
}
