using System;

namespace Shesha.Specifications.Exceptions
{
    /// <summary>
    /// Indicates that specified type doesn't implement specification of the specified entity
    /// </summary>
    public class SpecificationNotFoundException : Exception
    {
        /// <summary>
        /// Entity type
        /// </summary>
        public Type EntityType { get; private set; }

        /// <summary>
        /// Specification name
        /// </summary>
        public string SpecificationName { get; private set; }

        public SpecificationNotFoundException(Type entityType, string specificationName): base($"Specification with name `{specificationName}` not found for entity type `{entityType.FullName}`")
        {
            EntityType = entityType;
            SpecificationName = specificationName;
        }
    }
}
