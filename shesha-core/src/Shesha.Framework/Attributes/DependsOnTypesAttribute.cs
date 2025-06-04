using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// Used to define dependencies of an type to other types.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class DependsOnTypesAttribute : Attribute
    {
        /// <summary>
        /// Types of depended types
        /// </summary>
        public Type[] DependedTypes { get; private set; }

        public DependsOnTypesAttribute(params Type[] dependedTypes)
        {
            DependedTypes = dependedTypes;
        }
    }
}
