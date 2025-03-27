using Shesha.Cache;
using System.Collections.Generic;
using static Shesha.DynamicEntities.Mapper.DynamicDtoMappingHelper;

namespace Shesha.DynamicEntities.Mapper.Cache
{

    public interface IMapperCacheHolder : ICacheHolder<string, List<MapperItem>>
    {
    }
}
