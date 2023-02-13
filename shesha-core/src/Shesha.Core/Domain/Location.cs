using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Represents a location of some sort. Typically the location of the organisations various
    /// offices.
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.Location")]
    public class Location : Area
    {

    }
}
