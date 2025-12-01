using Shesha.Domain;
using System;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class EntityInitializationException : Exception
    {
        public EntityConfig EntityConfig { get; set; }

        public EntityInitializationException(EntityConfig entityConfig, Exception? exception = null, string? actionText = "initialize", string? message = null)
            : base(message ?? $"Failed to {actionText} Entity {entityConfig.Module?.Name} : {entityConfig.Name}", exception)
        {
            EntityConfig = entityConfig;
        }
    }
}
