namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Broadcasts L1 cache invalidations between application instances over Redis pub/sub.
    ///
    /// Without this, a write on one instance would stay invisible to the others until their L1
    /// entries expired. With it, propagation is immediate and the TTL is only a backstop.
    /// </summary>
    public interface IShaCacheInvalidationBus
    {
        /// <summary>
        /// Identifies this process, so an instance ignores the messages it published itself.
        /// </summary>
        string NodeId { get; }

        /// <summary>
        /// True when the subscription is live. False means Redis pub/sub was unavailable and
        /// coherence has fallen back to L1 expiry alone.
        /// </summary>
        bool IsConnected { get; }

        /// <summary>
        /// Registers a handler invoked when another instance invalidates a key in
        /// <paramref name="cacheName"/>. The key is the normalized cache key, or
        /// <see cref="ClearAllKeys"/> for a whole-cache clear.
        /// </summary>
        void Subscribe(string cacheName, Action<string> onInvalidated);

        /// <summary>
        /// Tells the other instances to drop <paramref name="normalizedKey"/> from their L1.
        /// </summary>
        void Publish(string cacheName, string normalizedKey);

        /// <summary>
        /// Async counterpart of <see cref="Publish"/>.
        /// </summary>
        Task PublishAsync(string cacheName, string normalizedKey);

        /// <summary>
        /// Sentinel key meaning "drop every entry in this cache".
        /// </summary>
        const string ClearAllKeys = "*";
    }
}
