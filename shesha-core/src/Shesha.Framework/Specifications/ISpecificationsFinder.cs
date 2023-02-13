using System;
using System.Collections.Generic;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specifications finder. Provides information about available specifications in the application
    /// </summary>
    public interface ISpecificationsFinder
    {
        /// <summary>
        /// List of global specifications
        /// </summary>
        IEnumerable<ISpecificationInfo> GlobalSpecifications { get; }

        /// <summary>
        /// List of all specifications
        /// </summary>
        IEnumerable<ISpecificationInfo> AllSpecifications { get; }

        /// <summary>
        /// Get specification for the specified <paramref name="entityType"/> with the specified <paramref name="name"/>
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="name">Specification name</param>
        /// <returns></returns>
        ISpecificationInfo FindSpecification(Type entityType, string name);
    }
}
