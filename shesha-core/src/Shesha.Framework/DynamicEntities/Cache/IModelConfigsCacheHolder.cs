using Shesha.Cache;
using Shesha.DynamicEntities.Dtos;

namespace Shesha.DynamicEntities.Cache
{
    public interface IModelConfigsCacheHolder : ICacheHolder<string, ModelConfigurationDto?>
    {
        string GetCacheKey(string? @namespace, string className);
    }
}
