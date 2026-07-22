using Shesha.Configuration.Runtime;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    public interface IDynamicEntityTypeBuilder
    {
        Task<List<Type>> GenerateTypesAsync(IEntityTypeConfigurationStore entityConfigurationStore);
    }
}
