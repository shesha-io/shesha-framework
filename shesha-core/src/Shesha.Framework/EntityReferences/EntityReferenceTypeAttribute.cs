using Shesha.Extensions;
using System;

namespace Shesha.EntityReferences
{
    [AttributeUsage(AttributeTargets.Property)]
    public class EntityReferenceTypeAttribute: Attribute
    {
        public Type EntityType { get; }

        public EntityReferenceTypeAttribute(Type entityType)
        {
            if (entityType is null)
                throw new ArgumentNullException(nameof(entityType));
            if (!entityType.IsEntityType())
                throw new ArgumentException($"{entityType.Name} is not an entity type", nameof(entityType));
            EntityType = entityType;
        }
    }
}
