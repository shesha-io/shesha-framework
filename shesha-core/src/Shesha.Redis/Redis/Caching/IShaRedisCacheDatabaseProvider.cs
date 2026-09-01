using StackExchange.Redis;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Used to get <see cref="IDatabase"/> for Redis cache.
    /// </summary>
    public interface IShaRedisCacheDatabaseProvider 
    {
        /// <summary>
        /// Gets the database connection.
        /// </summary>
        IDatabase GetDatabase();

        /// <summary>
        /// Gets a pub/sub subscriber on the same connection. Used to broadcast L1 cache
        /// invalidations between instances.
        /// </summary>
        ISubscriber GetSubscriber();
    }
}
