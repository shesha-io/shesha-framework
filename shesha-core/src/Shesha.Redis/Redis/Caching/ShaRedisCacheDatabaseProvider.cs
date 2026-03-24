using Abp.Dependency;
using StackExchange.Redis;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Implements <see cref="IShaRedisCacheDatabaseProvider"/>.
    /// </summary>
    public class ShaRedisCacheDatabaseProvider : IShaRedisCacheDatabaseProvider, ISingletonDependency
    {
        private readonly ShaRedisCacheOptions _options;
        private readonly Lazy<ConnectionMultiplexer> _connectionMultiplexer;

        /// <summary>
        /// Initializes a new instance of the <see cref="ShaRedisCacheDatabaseProvider"/> class.
        /// </summary>
        public ShaRedisCacheDatabaseProvider(ShaRedisCacheOptions options)
        {
            _options = options;
            _connectionMultiplexer = new Lazy<ConnectionMultiplexer>(CreateConnectionMultiplexer);
        }

        /// <summary>
        /// Gets the database connection.
        /// </summary>
        public IDatabase GetDatabase()
        {
            return _connectionMultiplexer.Value.GetDatabase(_options.DatabaseId);
        }

        private ConnectionMultiplexer CreateConnectionMultiplexer()
        {
            return ConnectionMultiplexer.Connect(_options.ConnectionString);
        }
    }
}
