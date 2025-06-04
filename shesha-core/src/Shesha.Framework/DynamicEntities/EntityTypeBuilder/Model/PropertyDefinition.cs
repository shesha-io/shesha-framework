using Shesha.Domain;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.EntityTypeBuilder.Model
{
    public class PropertyDefinition
    {
        public int CreationOrder { get; set; }

        public EntityProperty Config { get; set; }

        public string Name { get; set; }

        public NamespaceDefinition NamespaceDefinition { get; set; }

        public TypeDefinition TypeDefinition { get; set; }

        public Type PropertyType { get; set; }

        public TypeDefinition PropertyTypeDefinition { get; set; }

        public List<Attribute> Attributes { get; set; }
    }
}
