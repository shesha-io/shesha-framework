using Shesha.Domain;
using System;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class EntityPropertyDbInitializationException : Exception
    {
        public EntityProperty EntityProperty { get; set; }

        public EntityPropertyDbInitializationException(EntityProperty entityProperty, Exception? exception = null, string? actionText = "initialize DB", string? message = null)
            : base
            (
                message 
                  ?? $"Failed to {actionText} Entity Property {entityProperty.EntityConfig.Module?.Name} : {entityProperty.EntityConfig.Name}.{entityProperty.Name}"
                , exception
            )
        {
            EntityProperty = entityProperty;
        }
    }
}
