using System;

namespace Shesha.Bootstrappers
{
    /// <summary>
    /// Used to define dependencies of an IBootstrapper to other bootstrappers.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class DependsOnBootstrapperAttribute: Attribute
    {
        /// <summary>
        /// Types of depended bootstrappers
        /// </summary>
        public Type[] DependedBootstrappers { get; private set; }

        public DependsOnBootstrapperAttribute(params Type[] dependedBootstrappers)
        {
            DependedBootstrappers = dependedBootstrappers;
        }
    }
}
