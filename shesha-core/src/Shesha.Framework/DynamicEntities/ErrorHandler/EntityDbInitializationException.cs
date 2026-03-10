using Shesha.Domain;
using System;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class EntityDbInitializationException : Exception
    {
        public EntityConfig EntityConfig { get; }

        public EntityDbInitializationException(EntityConfig entityConfig, Exception? exception = null, string? actionText = "initialize DB", string? message = null)
            : base(message ?? $"Failed to {actionText} Entity {entityConfig.Module?.Name ?? "Unknown"} : {entityConfig.Name}", exception)
        {
            EntityConfig = entityConfig;
        }
    }
}
