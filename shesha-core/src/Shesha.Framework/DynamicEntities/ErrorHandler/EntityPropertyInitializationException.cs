using Shesha.Domain;
using System;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class EntityPropertyInitializationException : Exception
    {
        public EntityProperty? EntityProperty { get; }

        public EntityPropertyInitializationException(EntityProperty? entityProperty, Exception? exception = null, string? actionText = "initialize", string? message = null)
            : base
            (
                message 
                ?? (entityProperty != null
                    ? $"Failed to {actionText} Entity Property {entityProperty?.EntityConfig.Module?.Name} : {entityProperty?.EntityConfig.Name}.{entityProperty?.Name}"
                    : $"Failed to {actionText} Entity Property")
                , exception
            )
        {
            EntityProperty = entityProperty;
        }
    }
}
