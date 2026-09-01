namespace Shesha.Cache
{
    /// <summary>
    /// Cache item wrapper. Is used to prevent infinite fetching of cached null values
    /// </summary>
    /// <typeparam name="TItem"></typeparam>
    public class CacheItemWrapper<TItem>
    {
        public TItem DefaultValue { get; set; }
        public TItem DbValue { get; set; }

        /// <summary>
        /// Required for deserialization.
        ///
        /// Without it Newtonsoft has to use the parameterized constructor, which is markedly slower
        /// and allocates far more: it materializes every JSON property into an intermediate
        /// structure before matching names to constructor parameters, for the whole object graph.
        /// This type sits on the per-request permission lookup, so that cost was paid on every
        /// authenticated request.
        /// </summary>
        public CacheItemWrapper()
        {
            DefaultValue = default!;
            DbValue = default!;
        }

        public CacheItemWrapper(TItem defaultValue, TItem dBValue)
        {
            DefaultValue = defaultValue;
            DbValue = dBValue;
        }
    }
}
