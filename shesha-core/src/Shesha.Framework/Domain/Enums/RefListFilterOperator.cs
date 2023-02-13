using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Operator to use for joining 2 filters (and/or)
    /// </summary>
    [ReferenceList("Shesha.Framework", "FilterJoinOperator")]
    public enum RefListFilterJoinOperator
    {
        /// <summary>
        /// AND
        /// </summary>
        And = 0,
        /// <summary>
        /// OR
        /// </summary>
        Or = 1
    }
}