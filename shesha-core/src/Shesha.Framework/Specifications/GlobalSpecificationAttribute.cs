using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// Is used to mark specifications as global
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class GlobalSpecificationAttribute: Attribute
    {
    }
}
