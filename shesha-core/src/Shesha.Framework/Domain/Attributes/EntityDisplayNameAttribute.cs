using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute used to identify the property within an entity class that 
    /// can be used as a name/description identifying the entity to a user.
    /// Only one property per entity class should be decorated with this attribute.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
    public class EntityDisplayNameAttribute : Attribute
    {

    }
}