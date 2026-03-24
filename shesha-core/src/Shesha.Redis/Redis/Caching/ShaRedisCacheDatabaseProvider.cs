using Abp.Dependency;
using StackExchange.Redis;
using StackExchange.Redis.Resilience;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Implements <see cref="IShaRedisCacheDatabaseProvider"/>.
    /// </summary>
    public class ShaRedisCacheDatabaseProvider : IShaRedisCacheDatabaseProvider, ISingletonDependency
    {
        private readonly ShaRedisCacheOptions _options;
        private readonly IResilientConnectionMultiplexer _connectionMultiplexer;

        /// <summary>
        /// Initializes a new instance of the <see cref="ShaRedisCacheDatabaseProvider"/> class.
        /// </summary>
        public ShaRedisCacheDatabaseProvider(ShaRedisCacheOptions options)
        {
            _options = options;
            _connectionMultiplexer = CreateMultiplexer();
        }

        /// <summary>
        /// Gets the database connection.
        /// </summary>
        public IDatabase GetDatabase()
        {
            return _connectionMultiplexer.GetDatabase(_options.DatabaseId);
        }

        private IResilientConnectionMultiplexer CreateMultiplexer()
        {
            var multiplexer = new ResilientConnectionMultiplexer(() => ConnectionMultiplexer.Connect(_options.ConnectionString));
            return multiplexer;
        }
    }
}
