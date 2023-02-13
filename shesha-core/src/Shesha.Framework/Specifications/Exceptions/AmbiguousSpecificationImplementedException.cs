using System;

namespace Shesha.Specifications.Exceptions
{
    /// <summary>
    /// Indicates that specified type implement more than one specification of the specified entity
    /// </summary>
    public class AmbiguousSpecificationImplementedException : Exception
    {
        public Type SpecificationsType { get; private set; }
        public Type EntityType { get; private set; }
        

        public AmbiguousSpecificationImplementedException(Type specificationsType, Type entityType): base($"Class `{specificationsType.FullName}` implements multiple specification of the `{entityType.FullName}` entity type")
        {
            SpecificationsType = specificationsType;
            EntityType = entityType;
        }
    }
}
