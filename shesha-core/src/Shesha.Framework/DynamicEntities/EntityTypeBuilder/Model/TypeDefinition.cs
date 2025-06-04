using Shesha.Domain;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.EntityTypeBuilder.Model
{
    public class TypeDefinition
    {
        public int CreationOrder { get; set; }

        public EntityConfig Config { get; set; }

        public string Name { get; set; }

        public NamespaceDefinition NamespaceDefinition { get; set; }

        public TypeDefinition InheritedFrom { get; set; }

        public Type InheritedFromClass { get; set; }

        public List<Attribute> Attributes { get; set; }

        public List<PropertyDefinition> Properties { get; set; }
    }
}
