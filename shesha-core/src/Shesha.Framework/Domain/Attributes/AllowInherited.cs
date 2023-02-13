using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Is used on one-to-many properties. If the property marked with this attribute the system allows to use inherited entities as a value. 
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class AllowInheritedAttribute : Attribute
    {
    }
}
