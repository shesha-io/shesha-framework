using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("PermissionedEntityIsRequired")]
    public enum RefListPermissionedEntityIsRequired
    {
        Yes = 1,
        No = 2,
        Optional = 3
    }
}
