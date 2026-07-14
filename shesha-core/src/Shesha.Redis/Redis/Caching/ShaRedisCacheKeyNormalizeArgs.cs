namespace Shesha.Redis.Caching
{
    public class ShaRedisCacheKeyNormalizeArgs
    {
        public string Key { get; }

        public string CacheName { get; }

        public bool MultiTenancyEnabled { get; }

        public ShaRedisCacheKeyNormalizeArgs(
            string key,
            string cacheName,
            bool multiTenancyEnabled)
        {
            Key = key;
            CacheName = cacheName;
            MultiTenancyEnabled = multiTenancyEnabled;
        }
    }
}
