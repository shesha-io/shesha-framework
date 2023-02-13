using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Cache
{
    /// <summary>
    /// EntityConfig cache item
    /// </summary>
    public class EntityConfigCacheItem
    {
        public EntityConfigDto EntityConfig { get; set; }

        public List<EntityPropertyDto> Properties { get; set; }
    }
}
