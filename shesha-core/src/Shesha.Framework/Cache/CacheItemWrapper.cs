namespace Shesha.Cache
{
    /// <summary>
    /// Cache item wrapper. Is used to prevent infinite fetching of cached null values
    /// </summary>
    /// <typeparam name="TItem"></typeparam>
    public class CacheItemWrapper<TItem>
    {
        public TItem Value { get; private set; }

        public CacheItemWrapper(TItem value)
        {
            Value = value;
        }
    }
}
