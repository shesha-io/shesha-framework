using System;

namespace Shesha.Specifications.Exceptions
{
    /// <summary>
    /// Indicates that specified type doesn't implement specification of the specified entity
    /// </summary>
    public class SpecificationNotImplementedException: Exception
    {
        public Type SpecificationsType { get; private set; }
        public Type EntityType { get; private set; }
        

        public SpecificationNotImplementedException(Type specificationsType, Type entityType): base($"Class `{specificationsType.FullName}` doesn't implement specification of the `{entityType.FullName}` entity type")
        {
            SpecificationsType = specificationsType;
            EntityType = entityType;
        }
    }
}
