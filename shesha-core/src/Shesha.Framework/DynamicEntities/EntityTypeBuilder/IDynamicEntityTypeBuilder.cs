using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.DynamicEntities.EntityTypeBuilder.Model;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    public interface IDynamicEntityTypeBuilder
    {
        List<Type> GenerateTypes(IEntityTypeConfigurationStore entityConfigurationStore);

        /*List<Type> CreateTypes(ModuleBuilder moduleBuilder, List<EntityConfig> configs, EntityTypeBuilderContext context);

        Type CreateType(ModuleBuilder moduleBuilder, EntityConfig entityConfig, EntityTypeBuilderContext context);

        Type CreateType(ModuleBuilder moduleBuilder, EntityConfig entityConfig, List<EntityProperty>? properties, EntityTypeBuilderContext context);*/
    }
}
