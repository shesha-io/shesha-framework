using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Cache
{
    /// <summary>
    /// Configuration itm client-side cache item
    /// </summary>
    public class ConfigurationItemCacheItem
    {
        public string? Md5 { get; set; }

        public Dictionary<string, string?> NestedMd5s { get; set; }

        public ConfigurationItemCacheItem()
        {
            NestedMd5s = new Dictionary<string, string?>();
        }
    }
}
