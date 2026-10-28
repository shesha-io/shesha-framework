using Shesha.Domain.Attributes;
using System.ComponentModel;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    /// <summary>
    /// Statuses for a Members Membership
    /// </summary>
    [ReferenceList("SheshaFunctionalTests", "MembershipStatuses")]
    public enum RefListMembershipStatuses : long
    {
        /// <summary>
        /// Membership status is still being processed
        /// </summary>
        [Description("In Progress")]
        InProgress = 1,
        /// <summary>
        /// Membership status is active
        /// </summary>
        [Description("Active")]
        Active = 2,
        /// <summary>
        /// Membership status is cancelled
        /// </summary>
        [Description("Cancelled")]
        Cancelled = 3
    }
}
