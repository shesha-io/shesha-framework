using Shesha.Domain;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.EntityTypeBuilder.Model
{
    public class NamespaceDefinition
    {
        public string Name { get; set; }

        public List<TypeDefinition> Types { get; set; } = new List<TypeDefinition>();

        /*public TypeDefinition AddTypeDefinition(EntityConfig config)
        {
            return AddTypeDefinition(config.Name, )
        }*/


        public TypeDefinition AddTypeDefinition(string name, Type inheritedFom, EntityConfig config)
        {
            var typeDefinition = new TypeDefinition()
            {
                NamespaceDefinition = this,
                Name = name,
                InheritedFromClass = inheritedFom,
                Config = config,
            };
            Types.Add(typeDefinition);
            return typeDefinition;
        }
    }
}
