using Shesha.Configuration.Runtime;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace Shesha.DynamicEntities.EntityTypeBuilder.Model
{
    public class EntityTypeBuilderType
    {
        public EntityConfig EntityConfig { get; set; }

        public TypeBuilder TypeBuilder { get; set; }
        
        public Type? Type { get; set; }
    }

    public class EntityTypeBuilderContext
    {
        public EntityTypeBuilderContext() { }

        public List<EntityTypeBuilderType> Types { get; set; } = new List<EntityTypeBuilderType>();

        public IEntityConfigurationStore EntityConfigurationStore { get; set; }

        public Dictionary<Module, ModuleBuilder> ModuleBuilders { get; set; } = new Dictionary<Module, ModuleBuilder>();
    }
}
