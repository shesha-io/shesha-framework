namespace Shesha.Cache
{
    /// <summary>
    /// Cache item wrapper. Is used to prevent infinite fetching of cached null values
    /// </summary>
    /// <typeparam name="TItem"></typeparam>
    public class CacheItemWrapper<TItem>
    {
        public TItem DefaultValue { get; private set; }
        public TItem DbValue { get; private set; }

        public CacheItemWrapper(TItem defaultValue, TItem dBValue)
        {
            DefaultValue = defaultValue;
            DbValue = dBValue;
        }
    }
}
