using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "VisibilityType")]
    public enum RefListVisibilityType
    {
        Private = 1,
        Public = 2,
        Owner = 3
    }
}
