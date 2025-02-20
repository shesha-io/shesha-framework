using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using System.Collections.Generic;
using static Shesha.DynamicEntities.Mapper.DynamicDtoMappingHelper;

namespace Shesha.DynamicEntities.Mapper.Cache
{
    public class MapperCacheHolder : CacheHolder<string, List<MapperItem>>, IMapperCacheHolder, ISingletonDependency
    {
        public MapperCacheHolder(ICacheManager cacheManager) : base("DynamicDtoMappersCache", cacheManager)
        {
        }
    }
}
