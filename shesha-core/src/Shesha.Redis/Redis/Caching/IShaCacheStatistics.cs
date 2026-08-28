using Abp.Dependency;
using System.Collections.Concurrent;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Exposes L1 hit/miss counters per named cache.
    ///
    /// Without this the L1 layer can only be inferred from latency, which is too noisy to be
    /// evidence. The cache-coherence suite reads these to assert that repeat reads are actually
    /// served locally rather than from Redis.
    /// </summary>
    public interface IShaCacheStatistics
    {
        /// <summary>Registers a cache's L1 store so its counters can be reported.</summary>
        void Register(ShaRedisCacheL1Store store);

        /// <summary>Snapshot of every registered cache, keyed by cache name.</summary>
        IReadOnlyDictionary<string, ShaCacheStatisticsEntry> GetSnapshot();

        /// <summary>Zeroes all counters. Used to isolate a measurement.</summary>
        void Reset();
    }

    public class ShaCacheStatisticsEntry
    {
        public string CacheName { get; set; } = string.Empty;
        public long Hits { get; set; }
        public long Misses { get; set; }
        public long Invalidations { get; set; }
        public long OverflowPurges { get; set; }
        public int Entries { get; set; }

        /// <summary>Hit rate as a fraction of reads; 0 when nothing has been read yet.</summary>
        public double HitRate => Hits + Misses == 0 ? 0 : (double)Hits / (Hits + Misses);
    }

    /// <inheritdoc />
    public class ShaCacheStatistics : IShaCacheStatistics, ISingletonDependency
    {
        private readonly ConcurrentDictionary<string, ShaRedisCacheL1Store> _stores = new();

        public void Register(ShaRedisCacheL1Store store) => _stores[store.CacheName] = store;

        public IReadOnlyDictionary<string, ShaCacheStatisticsEntry> GetSnapshot()
        {
            return _stores.ToDictionary(
                pair => pair.Key,
                pair => new ShaCacheStatisticsEntry
                {
                    CacheName = pair.Value.CacheName,
                    Hits = pair.Value.Hits,
                    Misses = pair.Value.Misses,
                    Invalidations = pair.Value.Invalidations,
                    OverflowPurges = pair.Value.OverflowPurges,
                    Entries = pair.Value.Count,
                });
        }

        public void Reset()
        {
            foreach (var store in _stores.Values)
                store.ResetStatistics();
        }
    }
}
