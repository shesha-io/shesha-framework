using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;

namespace Shesha.Services.Settings.Cache
{
    public class SettingCacheHolder : CacheHolder<string, CachedSettingValue>, ISettingCacheHolder, ISingletonDependency
    {
        public SettingCacheHolder(ICacheManager cacheManager) : base("SettingsCache", cacheManager)
        {
        }
    }
}
