using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// todo: merge with FilterOperator
    /// </summary>
    [ReferenceList("Shesha.Framework", "FilterComparerType")]
    public enum RefListFilterComparerType
    {
        GreaterThan = 0,
        LessThan = 1,
        EqualTo = 2,
        GreaterOrEqualTo = 3,
        LessOrEqualTo = 4,

        Like = 5,
        All = 6,
        Any = 7,
        In = 8
    }
}