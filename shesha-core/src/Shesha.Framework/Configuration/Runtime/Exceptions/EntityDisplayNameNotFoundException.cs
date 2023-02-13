using System;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Exception indicates that the display name property is required for the requested entity type
    /// </summary>
    public class EntityDisplayNameNotFoundException : Exception
    {
        public Type EntityType { get; set; }

        public EntityDisplayNameNotFoundException(Type entityType) : base($"Display name is not specified for entity type '{entityType.FullName}'")
        {
            EntityType = entityType;
        }
    }
}
