using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "RoleAppointmentStatus")]
    public enum RefListRoleAppointmentStatus
    {
        ViewOnly = 1,
        Submitter = 2,
        Admin = 3
    }
}
