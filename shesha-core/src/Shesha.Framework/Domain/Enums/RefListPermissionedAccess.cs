using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "PermissionedAccess")]
    public enum RefListPermissionedAccess
    {
        Disable = 1,
        Inherited = 2,
        AnyAuthenticated = 3,
        RequiresPermissions = 4,
        AllowAnonymous = 5
    }
}