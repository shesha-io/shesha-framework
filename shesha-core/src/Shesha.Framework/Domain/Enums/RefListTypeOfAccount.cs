using Shesha.Domain.Attributes;
using System.ComponentModel;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "TypeOfAccount")]
    public enum RefListTypeOfAccount : long
    {
        [Description("External (Active Directory)")]
        External = 0,

        [Description("Internal (SQL account)")]
        Internal = 1
    }
}
