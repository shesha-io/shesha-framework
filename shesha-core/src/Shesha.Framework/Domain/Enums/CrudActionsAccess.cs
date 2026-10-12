using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// CRUD actions access type
    /// </summary>
    [ReferenceList("CrudActionsAccess")]
    [Flags]
    public enum CrudActionsAccess
    {
        AnyAuthenticated = 1,
        RequiresPermissions = 2,
        AllowAnonymous = 3
    }
}
