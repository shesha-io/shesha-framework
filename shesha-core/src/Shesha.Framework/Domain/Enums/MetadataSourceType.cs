using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Indicate the source of the entity/property metadata 
    /// </summary>
    [ReferenceList("Shesha.Framework", "MetadataSourceType")]
    public enum MetadataSourceType
    {
        ApplicationCode = 1,
        UserDefined = 2
    }
}
