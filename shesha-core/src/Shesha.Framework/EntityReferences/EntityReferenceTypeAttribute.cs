using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.EntityReferences
{
    [AttributeUsage(AttributeTargets.Property)]
    public class EntityReferenceTypeAttribute: Attribute
    {
        public Type EntityType { get; set; }

        public EntityReferenceTypeAttribute() { }

        public EntityReferenceTypeAttribute(Type entityType)
        {
            if (!entityType.IsEntityType())
                throw new ArgumentException($"{entityType.Name} is not an entity type", nameof(entityType));
            EntityType = entityType;
        }
    }
}
