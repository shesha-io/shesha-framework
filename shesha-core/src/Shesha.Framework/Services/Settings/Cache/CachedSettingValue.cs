namespace Shesha.Services.Settings.Cache
{
    /// <summary>
    /// Value wrapper for setting value cache. Is used to store null values in cache
    /// </summary>
    public class CachedSettingValue
    {
        public string Value { get; set; }

        /// <summary>
        /// Required for deserialization. Without it Newtonsoft falls back to the parameterized
        /// constructor path, which is significantly slower than setting properties directly.
        /// See <see cref="Shesha.Cache.CacheItemWrapper{TItem}"/> for the same reasoning.
        /// </summary>
        public CachedSettingValue()
        {
        }

        public CachedSettingValue(string value)
        {
            Value = value;
        }
    }
}
