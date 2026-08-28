using System.Collections.Concurrent;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// In-process cache sitting in front of Redis for a single named cache.
    ///
    /// Values are stored already deserialized, which is the entire point: the cost the Azure
    /// profiler flagged was JSON deserialization on every read, not the Redis round-trip. Storing
    /// the serialized payload instead would avoid the network hop but keep the deserialization,
    /// which is the part that hurts.
    ///
    /// IMPORTANT: because entries are stored deserialized, callers receive the SAME object instance
    /// on every hit until the entry is invalidated. That matches ABP's in-memory cache
    /// (<c>AbpMemoryCache</c>) but differs from the previous Redis behaviour, which handed out a
    /// fresh copy per read. Code that mutates a value obtained from the cache will now affect
    /// everything else holding it.
    /// </summary>
    public class ShaRedisCacheL1Store
    {
        private readonly ConcurrentDictionary<string, Entry> _entries = new();

        /// <summary>Serializes writes so the capacity check and the insert cannot interleave.</summary>
        private readonly object _writeLock = new();
        private readonly TimeSpan _ttl;
        private readonly int _maxEntries;

        private long _hits;
        private long _misses;
        private long _invalidations;
        private long _overflowPurges;

        public string CacheName { get; }

        public ShaRedisCacheL1Store(string cacheName, TimeSpan ttl, int maxEntries)
        {
            CacheName = cacheName;
            _ttl = ttl;
            _maxEntries = maxEntries > 0 ? maxEntries : int.MaxValue;
        }

        public long Hits => Interlocked.Read(ref _hits);
        public long Misses => Interlocked.Read(ref _misses);
        public long Invalidations => Interlocked.Read(ref _invalidations);
        public long OverflowPurges => Interlocked.Read(ref _overflowPurges);
        public int Count => _entries.Count;

        /// <summary>
        /// Looks up a value. Expiry is evaluated lazily on read rather than by a timer, so an
        /// untouched entry costs nothing until the next overflow purge.
        /// </summary>
        public bool TryGet(string normalizedKey, out object? value)
        {
            if (_entries.TryGetValue(normalizedKey, out var entry))
            {
                if (entry.ExpiresAtUtc > DateTime.UtcNow)
                {
                    Interlocked.Increment(ref _hits);
                    value = entry.Value;
                    return true;
                }

                // Expired: drop it so the caller repopulates from Redis.
                _entries.TryRemove(normalizedKey, out _);
            }

            Interlocked.Increment(ref _misses);
            value = null;
            return false;
        }

        public void Set(string normalizedKey, object? value)
        {
            var entry = new Entry(value, DateTime.UtcNow.Add(_ttl));

            // The capacity check, the purge and the insert have to happen as one step. Each is
            // individually safe on a ConcurrentDictionary, but the sequence is not: concurrent
            // writers with distinct keys could all observe Count < max and all insert, pushing the
            // store past the ceiling it exists to enforce -- or all observe Count >= max, each run
            // a full purge, and have one Clear discard what another had just written.
            //
            // Only writes are serialized. Reads stay lock-free and they dominate, and a Set is
            // already downstream of a Redis round-trip and a deserialization, so an uncontended
            // lock here is not measurable.
            lock (_writeLock)
            {
                // A key that is already present is replaced in place and cannot grow the store,
                // so it never triggers the overflow path.
                if (_entries.Count >= _maxEntries && !_entries.ContainsKey(normalizedKey))
                    PurgeForOverflow();

                _entries[normalizedKey] = entry;
            }
        }

        public void Remove(string normalizedKey)
        {
            if (_entries.TryRemove(normalizedKey, out _))
                Interlocked.Increment(ref _invalidations);
        }

        public void Clear()
        {
            var count = _entries.Count;
            _entries.Clear();
            if (count > 0)
                Interlocked.Add(ref _invalidations, count);
        }

        public void ResetStatistics()
        {
            Interlocked.Exchange(ref _hits, 0);
            Interlocked.Exchange(ref _misses, 0);
            Interlocked.Exchange(ref _invalidations, 0);
            Interlocked.Exchange(ref _overflowPurges, 0);
        }

        /// <summary>
        /// Drops expired entries; if that is not enough, drops everything. L1 exists to bound
        /// memory, so a hard ceiling matters more than preserving hit rate — and a full drop is
        /// cheap and predictable compared with tracking an LRU.
        /// </summary>
        private void PurgeForOverflow()
        {
            var now = DateTime.UtcNow;
            foreach (var pair in _entries)
            {
                if (pair.Value.ExpiresAtUtc <= now)
                    _entries.TryRemove(pair.Key, out _);
            }

            if (_entries.Count >= _maxEntries)
                _entries.Clear();

            Interlocked.Increment(ref _overflowPurges);
        }

        private readonly struct Entry
        {
            public Entry(object? value, DateTime expiresAtUtc)
            {
                Value = value;
                ExpiresAtUtc = expiresAtUtc;
            }

            public object? Value { get; }
            public DateTime ExpiresAtUtc { get; }
        }
    }
}
