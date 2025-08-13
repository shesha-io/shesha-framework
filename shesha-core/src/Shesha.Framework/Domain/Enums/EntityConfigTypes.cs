using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Indicate the type of the entity metadata 
    /// </summary>
    [ReferenceList("Shesha.Framework", "EntityConfigType")]
    public enum EntityConfigTypes
    {
        Class = 1,
        Interface = 2
    }
}
