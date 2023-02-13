using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "AreaType")]
    public enum RefListAreaType
    {
        Region = 1,
        Depot = 2,
        Area = 3,
        Suburb = 4,
        District = 5,
        Municipality = 6
    }
}