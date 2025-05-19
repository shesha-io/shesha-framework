using Shesha.Cache;

namespace Shesha.Services.Settings.Cache
{
    /// <summary>
    /// Settings cache holder
    /// </summary>
    public interface ISettingCacheHolder : ICacheHolder<string, CachedSettingValue>
    {
    }
}
