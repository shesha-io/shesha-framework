using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specification base info
    /// </summary>
    public interface ISpecificationBaseInfo
    {
        /// <summary>
        /// Type of specifications
        /// </summary>
        Type SpecificationsType { get; }

        /// <summary>
        /// Type of Entity
        /// </summary>
        Type EntityType { get; }
    }
}
