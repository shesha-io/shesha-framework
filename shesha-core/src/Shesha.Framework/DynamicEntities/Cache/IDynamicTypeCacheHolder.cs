using Shesha.Cache;
using System;

namespace Shesha.DynamicEntities.Cache
{
    public interface IDynamicTypeCacheHolder : ICacheHolder<string, Type>
    {
    }
}
