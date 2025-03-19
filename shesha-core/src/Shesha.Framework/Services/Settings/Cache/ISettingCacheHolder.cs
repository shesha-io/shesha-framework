using Shesha.Cache;

namespace Shesha.Services.Settings.Cache
{
    public interface ISettingCacheHolder : ICacheHolder<string, CachedSettingValue>
    {
    }
}
