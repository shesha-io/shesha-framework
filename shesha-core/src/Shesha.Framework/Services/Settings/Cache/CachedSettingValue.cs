namespace Shesha.Services.Settings.Cache
{
    /// <summary>
    /// Value wrapper for setting value cache. Is used to store null values in cache
    /// </summary>
    public class CachedSettingValue
    {
        public string? Value { get; set; }
        public CachedSettingValue(string? value) { 
            Value = value; 
        }
    }
}
