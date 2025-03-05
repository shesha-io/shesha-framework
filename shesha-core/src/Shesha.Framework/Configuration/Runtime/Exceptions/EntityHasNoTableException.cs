using System;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Entity type not found exception
    /// </summary>
    public class EntityHasNoTableException : Exception
    {
        public Type EntityType { get; set; }

        public EntityHasNoTableException(Type entityType) : base($"Entity of type '{entityType.FullName}' is not mapped to DB table")
        {
            EntityType = entityType;
        }
    }
}
