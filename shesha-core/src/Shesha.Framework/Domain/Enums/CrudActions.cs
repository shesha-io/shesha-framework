using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain.Enums
{
    // Individual CRUD actions — the single source of truth for the bit values
    public enum CrudAction
    {
        Create = 1,
        Read = 2,
        Update = 4,
        Delete = 8,
    }

    /// <summary>
    /// CRUD actions
    /// </summary>
    [ReferenceList("CrudActions")]
    [Flags]
    public enum CrudActions
    {
        None = 0,
        Create = CrudAction.Create,
        Read = CrudAction.Read,
        Update = CrudAction.Update,
        Delete = CrudAction.Delete,
        All = Create | Read | Update | Delete,
    }
}
