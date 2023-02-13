using System.ComponentModel;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "LogonMessageVisibility")]
    public enum RefListLogonMessageVisibility
    {
        [Description("All users")]
        AllUsers = 1,

        [Description("Only selected users")]
        SelectedUsers = 2
    }
}
