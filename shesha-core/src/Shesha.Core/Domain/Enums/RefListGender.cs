using System.ComponentModel;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "Gender")]
    public enum RefListGender
    {
        Male = 1,
        Female = 2,
        [Description("Not disclosed")]
        NotDisclosed = 3
    }
}
