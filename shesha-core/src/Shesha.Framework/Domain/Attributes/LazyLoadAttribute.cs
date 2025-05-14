using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Is used to mark property as lazy loaded
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class LazyLoadAttribute : Attribute
    {
    }
}
