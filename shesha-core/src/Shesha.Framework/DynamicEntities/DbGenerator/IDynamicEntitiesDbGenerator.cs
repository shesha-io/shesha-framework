using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.DbGenerator
{
    public interface IDynamicEntitiesDbGenerator
    {
        Task ProcessEntityConfigAsync(EntityConfig entityConfig, List<EntityProperty>? properties = null);
        Task ProcessEntityPropertyAsync(EntityProperty entityProperty);

        //Task ProcessEntityPropertyAsync(EntityProperty entityProperty, bool force);
    }
}