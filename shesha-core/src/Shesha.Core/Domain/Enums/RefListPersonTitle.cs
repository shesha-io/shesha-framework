using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "PersonTitles")]
    public enum RefListPersonTitle: int
    {
        Unknown = 0,
        Mr = 1,
        Mrs = 2,
        Ms = 3,
        Dr = 4,
        Prof = 5
    }
}
