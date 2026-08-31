using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Shesha.Redis.Caching;
using Shouldly;
using Xunit;

namespace Shesha.Tests.Caching
{
    /// <summary>
    /// Unit tests for the in-process L1 store that sits in front of Redis.
    ///
    /// The store's entry ceiling exists purely to bound memory, so the concurrency test below is
    /// the one that matters: the check-then-act sequence around it is not something the
    /// cluster-level cache tests can reach, because they exercise behaviour over HTTP rather than
    /// hammering a single store from many threads.
    /// </summary>
    public class ShaRedisCacheL1Store_Tests
    {
        private static ShaRedisCacheL1Store CreateStore(int maxEntries = 100, int ttlSeconds = 30) =>
            new("TestCache", TimeSpan.FromSeconds(ttlSeconds), maxEntries);

        // --- the ceiling ------------------------------------------------------------------

        [Fact]
        public void Concurrent_writes_of_distinct_keys_never_exceed_the_entry_ceiling()
        {
            // Regression test. Set used to read Count, decide whether to purge, and then insert as
            // three separate steps on a ConcurrentDictionary. Each step is individually safe, the
            // sequence is not: concurrent writers with distinct keys could all observe
            // Count < max and all insert, pushing the store past the ceiling it exists to enforce.
            const int maxEntries = 100;
            const int writers = 16;
            const int keysPerWriter = 250;

            var store = CreateStore(maxEntries);
            var observedCounts = new int[writers];

            Parallel.For(0, writers, writer =>
            {
                for (var i = 0; i < keysPerWriter; i++)
                {
                    store.Set($"w{writer}-k{i}", i);

                    // Sample as we go: a violation may be transient and gone by the end.
                    observedCounts[writer] = Math.Max(observedCounts[writer], store.Count);
                }
            });

            var peak = observedCounts.Max();
            peak.ShouldBeLessThanOrEqualTo(maxEntries,
                $"the store grew to {peak} entries against a ceiling of {maxEntries}; " +
                "the capacity check and the insert are no longer atomic");
        }

        [Fact]
        public void Concurrent_writes_of_the_same_key_do_not_grow_the_store()
        {
            // Replacing a key that is already present must not go through the overflow path and
            // must not add an entry, however many threads do it at once.
            var store = CreateStore(maxEntries: 10);

            Parallel.For(0, 500, i => store.Set("same-key", i));

            store.Count.ShouldBe(1);
            store.TryGet("same-key", out var value).ShouldBeTrue();
            value.ShouldNotBeNull();
        }

        [Fact]
        public void Reads_and_writes_can_run_concurrently_without_error()
        {
            // Reads are deliberately lock-free while writes are serialized; this guards against a
            // future change that makes the two paths inconsistent.
            var store = CreateStore(maxEntries: 50);
            var failures = 0;

            Parallel.Invoke(
                () => Parallel.For(0, 2000, i => store.Set($"key-{i % 80}", i)),
                () => Parallel.For(0, 2000, i =>
                {
                    try
                    {
                        store.TryGet($"key-{i % 80}", out _);
                    }
                    catch
                    {
                        Interlocked.Increment(ref failures);
                    }
                }));

            failures.ShouldBe(0);
            store.Count.ShouldBeLessThanOrEqualTo(50);
        }

        // --- basic behaviour --------------------------------------------------------------

        [Fact]
        public void A_stored_value_is_returned_by_the_same_key()
        {
            var store = CreateStore();
            var payload = new List<string> { "a", "b" };

            store.Set("key", payload);

            store.TryGet("key", out var value).ShouldBeTrue();

            // Reference equality is the whole point of L1: it returns the deserialized instance
            // rather than re-materializing it. Callers must not mutate what they get back.
            value.ShouldBeSameAs(payload);
        }

        [Fact]
        public void A_missing_key_is_a_miss()
        {
            var store = CreateStore();

            store.TryGet("absent", out var value).ShouldBeFalse();
            value.ShouldBeNull();

            store.Hits.ShouldBe(0);
            store.Misses.ShouldBe(1);
        }

        [Fact]
        public void An_expired_entry_is_a_miss_and_is_dropped()
        {
            // Expiry is evaluated lazily on read rather than by a timer.
            var store = CreateStore(ttlSeconds: 0);
            store.Set("key", "value");

            Thread.Sleep(50);

            store.TryGet("key", out var value).ShouldBeFalse();
            value.ShouldBeNull();
            store.Count.ShouldBe(0);
        }

        [Fact]
        public void Remove_drops_the_entry_and_counts_an_invalidation()
        {
            var store = CreateStore();
            store.Set("key", "value");

            store.Remove("key");

            store.TryGet("key", out _).ShouldBeFalse();
            store.Invalidations.ShouldBe(1);

            // Removing something that is not there is not an invalidation.
            store.Remove("key");
            store.Invalidations.ShouldBe(1);
        }

        [Fact]
        public void Clear_drops_everything()
        {
            var store = CreateStore();
            for (var i = 0; i < 5; i++)
                store.Set($"key-{i}", i);

            store.Clear();

            store.Count.ShouldBe(0);
            store.Invalidations.ShouldBe(5);
        }

        // --- bounded lifetime --------------------------------------------------------------

        [Fact]
        public void An_entry_never_outlives_the_remaining_redis_ttl()
        {
            // A value written with a short expiry -- or read shortly before it lapses -- must
            // not keep being served locally after Redis has dropped it. CacheOtpStorage writes
            // one-time pins with a remaining lifetime that shrinks towards zero as they age, so
            // without this an expired OTP could still validate for the rest of the L1 TTL.
            var store = CreateStore(ttlSeconds: 30);

            store.Set("short-lived", "value", maxLifetime: TimeSpan.FromMilliseconds(40));
            store.TryGet("short-lived", out _).ShouldBeTrue("the entry should be cached briefly");

            Thread.Sleep(80);

            store.TryGet("short-lived", out var value).ShouldBeFalse(
                "the entry outlived the remaining Redis TTL");
            value.ShouldBeNull();
        }

        [Fact]
        public void A_lifetime_longer_than_the_configured_ttl_does_not_extend_it()
        {
            // The bound only ever shortens: a long-lived Redis key must not stretch L1 past
            // its configured TTL.
            var store = CreateStore(ttlSeconds: 0);

            store.Set("key", "value", maxLifetime: TimeSpan.FromHours(1));
            Thread.Sleep(50);

            store.TryGet("key", out _).ShouldBeFalse("the configured TTL should still apply");
        }

        [Fact]
        public void An_already_lapsed_lifetime_is_not_cached_at_all()
        {
            var store = CreateStore(ttlSeconds: 30);

            store.Set("gone", "value", maxLifetime: TimeSpan.Zero);

            store.TryGet("gone", out _).ShouldBeFalse();
            store.Count.ShouldBe(0);
        }

        [Fact]
        public void A_lifetime_already_consumed_by_the_write_is_not_cached()
        {
            // Sliding expiries are a duration Redis starts counting at the write, so the
            // caller discounts however long the write took before handing the lifetime to L1.
            // If the write took longer than the value was meant to live, the discounted
            // lifetime goes negative and nothing should be cached.
            var store = CreateStore(ttlSeconds: 30);

            store.Set("key", "value", maxLifetime: TimeSpan.FromMilliseconds(-5));

            store.TryGet("key", out _).ShouldBeFalse();
            store.Count.ShouldBe(0);
        }

        // --- invalidation races ------------------------------------------------------------

        [Fact]
        public void A_fill_that_started_before_a_Remove_is_discarded()
        {
            // A read fetches from Redis, deserializes, then populates L1. If a Remove lands in
            // that window, the fill would otherwise reinsert the value and silently undo the
            // invalidation -- leaving a revoked value served locally until the TTL lapsed.
            var store = CreateStore();
            store.Set("key", "original");

            var generation = store.Generation;   // what a read would capture before fetching
            store.Remove("key");                 // invalidation arrives mid-fill

            store.Set("key", "stale-fill", maxLifetime: null, expectedGeneration: generation);

            store.TryGet("key", out _).ShouldBeFalse("the stale fill resurrected a removed entry");
        }

        [Fact]
        public void A_fill_that_started_before_a_Clear_is_discarded()
        {
            var store = CreateStore();
            store.Set("key", "original");

            var generation = store.Generation;
            store.Clear();

            store.Set("key", "stale-fill", maxLifetime: null, expectedGeneration: generation);

            store.TryGet("key", out _).ShouldBeFalse("the stale fill resurrected a cleared entry");
            store.Count.ShouldBe(0);
        }

        [Fact]
        public void A_fill_with_a_current_generation_is_kept()
        {
            // The guard must only drop fills that actually raced an invalidation.
            var store = CreateStore();

            var generation = store.Generation;
            store.Set("key", "value", maxLifetime: null, expectedGeneration: generation);

            store.TryGet("key", out var value).ShouldBeTrue();
            value.ShouldBe("value");
        }

        [Fact]
        public void An_authoritative_write_is_never_discarded()
        {
            // Writes pass no generation: a Set is the source of truth, not a fill.
            var store = CreateStore();
            store.Remove("key");   // advance the generation

            store.Set("key", "written");

            store.TryGet("key", out var value).ShouldBeTrue();
            value.ShouldBe("written");
        }

        [Fact]
        public void Fills_racing_invalidations_never_leave_a_removed_key_cached()
        {
            // Concurrent stress over the same key: every fill captures its generation first,
            // so whichever ordering wins, a fill can never outlive the Remove that followed it.
            var store = CreateStore();
            var resurrected = 0;

            Parallel.For(0, 400, i =>
            {
                var generation = store.Generation;
                store.Set("key", i, maxLifetime: null, expectedGeneration: generation);
                store.Remove("key");

                // Nothing may reappear under this key once the Remove above has completed,
                // unless another iteration legitimately filled it afterwards.
                if (store.TryGet("key", out _) && store.Generation == generation)
                    Interlocked.Increment(ref resurrected);
            });

            resurrected.ShouldBe(0);
        }

        // --- statistics --------------------------------------------------------------------

        [Fact]
        public void Hits_and_misses_are_counted_separately()
        {
            var store = CreateStore();
            store.Set("key", "value");

            store.TryGet("key", out _);
            store.TryGet("key", out _);
            store.TryGet("absent", out _);

            store.Hits.ShouldBe(2);
            store.Misses.ShouldBe(1);
        }

        [Fact]
        public void ResetStatistics_zeroes_the_counters_but_keeps_the_entries()
        {
            // The cache tests reset counters between measurements; that must not also drop the
            // entries, or every measurement would start from a cold cache.
            var store = CreateStore();
            store.Set("key", "value");
            store.TryGet("key", out _);
            store.TryGet("absent", out _);

            store.ResetStatistics();

            store.Hits.ShouldBe(0);
            store.Misses.ShouldBe(0);
            store.Invalidations.ShouldBe(0);
            store.OverflowPurges.ShouldBe(0);

            store.Count.ShouldBe(1);
            store.TryGet("key", out _).ShouldBeTrue();
        }

        [Fact]
        public void Overflow_purges_expired_entries_before_dropping_everything()
        {
            // With a ceiling of 2 and both entries already expired, adding a third should reclaim
            // by expiry rather than clearing the store wholesale.
            var store = new ShaRedisCacheL1Store("TestCache", TimeSpan.FromMilliseconds(1), maxEntries: 2);
            store.Set("a", 1);
            store.Set("b", 2);

            Thread.Sleep(20);
            store.Set("c", 3);

            store.Count.ShouldBe(1);
            store.TryGet("c", out var value).ShouldBeTrue();
            value.ShouldBe(3);
            store.OverflowPurges.ShouldBe(1);
        }

        [Fact]
        public void A_non_positive_max_entries_means_unbounded()
        {
            // ShaRedisCacheOptions could be configured with 0; that should mean "no ceiling"
            // rather than "never cache anything".
            var store = new ShaRedisCacheL1Store("TestCache", TimeSpan.FromSeconds(30), maxEntries: 0);

            for (var i = 0; i < 1000; i++)
                store.Set($"key-{i}", i);

            store.Count.ShouldBe(1000);
            store.OverflowPurges.ShouldBe(0);
        }
    }

    /// <summary>
    /// The exception contract of the serializer's type resolution.
    ///
    /// ShaRedisCache catches TypeLoadException specifically so a cached entry whose type no longer
    /// exists is evicted instead of failing every request until it expires. That catch filter is
    /// only correct while resolution keeps throwing this exact type, so it is pinned here.
    /// </summary>
    public class DefaultRedisCacheSerializer_Tests
    {
        private class Probe : DefaultRedisCacheSerializer
        {
            public static Type Resolve(string typeName) => ResolveType(typeName);
        }

        [Fact]
        public void An_unresolvable_type_name_throws_TypeLoadException()
        {
            Should.Throw<TypeLoadException>(() =>
                Probe.Resolve("Shesha.Does.Not.Exist, Shesha.Framework"));
        }

        [Fact]
        public void A_resolvable_type_name_round_trips_and_is_memoized()
        {
            var expected = typeof(ShaRedisCacheL1Store);

            var first = Probe.Resolve(expected.AssemblyQualifiedName!);
            var second = Probe.Resolve(expected.AssemblyQualifiedName!);

            first.ShouldBe(expected);
            second.ShouldBeSameAs(first);
        }
    }

}
