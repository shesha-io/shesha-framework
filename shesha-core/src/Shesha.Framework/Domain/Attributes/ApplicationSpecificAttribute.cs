using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Is used to mark <see cref="ConfigurationItem"/> as application specific
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class ApplicationSpecificAttribute: Attribute
    {
    }
}
