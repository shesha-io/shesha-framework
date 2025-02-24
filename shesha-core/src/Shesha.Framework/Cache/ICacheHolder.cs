using Abp.Runtime.Caching;

namespace Shesha.Cache
{
    /// <summary>
    /// Cache holder. Is used as a generic wrapper of the ABP cache
    /// </summary>
    /// <typeparam name="TKey"></typeparam>
    /// <typeparam name="TValue"></typeparam>
    public interface ICacheHolder<TKey, TValue>
    {
        /// <summary>
        /// Cache
        /// </summary>
        ITypedCache<TKey, TValue> Cache { get; }
    }
}
