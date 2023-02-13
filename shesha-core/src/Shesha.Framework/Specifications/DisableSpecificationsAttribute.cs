using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// This attribute is used to disable all active specifications
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class DisableSpecificationsAttribute : Attribute
    {
    }
}
