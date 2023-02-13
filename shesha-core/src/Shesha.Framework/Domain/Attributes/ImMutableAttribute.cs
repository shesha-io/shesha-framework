using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Indicates that the entity is immutable (readonly). Is used for entities mapped to views
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class ImMutableAttribute : Attribute
    {
    }
}
