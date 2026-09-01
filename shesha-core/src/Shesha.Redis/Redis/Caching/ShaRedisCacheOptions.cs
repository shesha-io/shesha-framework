using Abp.Configuration.Startup;

namespace Shesha.Redis.Caching
{
    public class ShaRedisCacheOptions
    {
        public IAbpStartupConfiguration AbpStartupConfiguration { get; } = default!;

        public string ConnectionString { get; set; } = default!;

        public int DatabaseId { get; set; }

        public string OnlineClientsStoreKey = "Abp.RealTime.OnlineClients";

        public string KeyPrefix { get; set; } = default!;

        public bool TenantKeyEnabled { get; set; }

        // --- L1 (in-process) cache ---------------------------------------------------------

        /// <summary>
        /// Keep a short-lived in-process copy of values read from Redis.
        ///
        /// Without it every read pays a network round-trip AND a full JSON deserialization, on a
        /// path that runs several times per request (permission lookup, settings, user permissions).
        ///
        /// Coherence is maintained by broadcasting invalidations over Redis pub/sub
        /// (see <see cref="ShaCacheInvalidationBus"/>); <see cref="L1ExpirationSeconds"/> is the
        /// backstop if a message is ever missed.
        /// </summary>
        public bool L1Enabled { get; set; } = true;

        /// <summary>
        /// Absolute lifetime of an L1 entry. This bounds staleness if a pub/sub invalidation is
        /// lost — it is not the normal propagation path, which is immediate.
        /// </summary>
        public int L1ExpirationSeconds { get; set; } = 30;

        /// <summary>
        /// Maximum entries held per cache. On overflow, expired entries are purged first; if the
        /// cache is still over the limit it is dropped wholesale rather than evicting one by one.
        /// The point of L1 is to bound memory, so a hard ceiling matters more than hit rate.
        /// </summary>
        public int L1MaxEntriesPerCache { get; set; } = 10_000;

        /// <summary>
        /// Broadcast invalidations to the other instances over Redis pub/sub. Disabling this leaves
        /// only <see cref="L1ExpirationSeconds"/> for coherence, which means writes take up to that
        /// long to be seen elsewhere. Only sensible for a single-instance deployment.
        /// </summary>
        public bool L1InvalidationBroadcastEnabled { get; set; } = true;

        /// <summary>
        /// Required for serialization
        /// </summary>
        public ShaRedisCacheOptions()
        {

        }

        public ShaRedisCacheOptions(IAbpStartupConfiguration abpStartupConfiguration)
        {
            AbpStartupConfiguration = abpStartupConfiguration;

            ConnectionString = "";
            DatabaseId = 0;
            KeyPrefix = "";
            TenantKeyEnabled = false;
        }
    }
}
