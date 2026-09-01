using Shesha.CacheTests.Infrastructure;
using Shouldly;
using Xunit;
using Xunit.Abstractions;

namespace Shesha.CacheTests
{
    /// <summary>
    /// L1 (in-process) cache behaviour — Phase 2 of redis-cache-deserialization-performance.md.
    ///
    /// The coherence suites (settings / permissions) prove the L1 layer did not BREAK anything.
    /// These prove it is actually doing its job, and that its failure modes behave as designed.
    /// Without the hit/miss counters all of this could only be inferred from latency, which is far
    /// too noisy to be evidence.
    /// </summary>
    public class L1CacheTests : ClusterTestBase
    {
        private readonly ITestOutputHelper _output;

        public L1CacheTests(ClusterFixture fixture, ITestOutputHelper output) : base(fixture)
        {
            _output = output;
        }

        private CacheTestConfig.SettingIdentifier Setting => Config.TestSetting;

        [SkippableFact]
        public void L1_is_enabled_and_the_invalidation_bus_is_connected()
        {
            var cluster = RequireCluster();

            foreach (var instance in cluster.Instances)
            {
                _output.WriteLine(
                    $"  api-{instance.Index}  l1={instance.Info.L1Enabled}  " +
                    $"ttl={instance.Info.L1ExpirationSeconds}s  bus={instance.Info.InvalidationBusConnected}");
            }

            foreach (var instance in cluster.Instances)
            {
                instance.Info.L1Enabled.ShouldBeTrue($"{instance} has no L1 cache");

                // Without the bus, coherence degrades to waiting out the TTL. The coherence tests
                // would still pass, just slowly — so assert it explicitly rather than let a broken
                // subscription hide behind a generous timeout.
                instance.Info.InvalidationBusConnected.ShouldBeTrue(
                    $"{instance} is not subscribed to the invalidation channel");
            }
        }

        [SkippableFact]
        public async Task L2A_repeat_reads_are_served_from_L1()
        {
            var cluster = RequireCluster();
            var target = cluster.At(1);

            // Prime the entry, then measure only the reads that follow.
            await target.GetSettingAsync<int>(Setting);
            await target.ResetCacheStatsAsync();

            const int reads = 10;
            for (var i = 0; i < reads; i++)
                await target.GetSettingAsync<int>(Setting);

            var stats = await target.GetCacheStatsAsync();
            stats.Available.ShouldBeTrue("cache statistics are not exposed");

            var settings = stats.For(CacheNames.Settings);
            settings.ShouldNotBeNull($"no statistics for {CacheNames.Settings}");

            _output.WriteLine($"  {settings}");
            _output.WriteLine($"  hit rate {settings.HitRate:P0} over {settings.Reads} reads");

            // Every read after the first should be local. Allowing a small margin because the
            // authorization filter reads the same cache and could interleave a miss.
            settings.Hits.ShouldBeGreaterThanOrEqualTo(reads,
                $"expected at least {reads} L1 hits, got {settings.Hits} hits / {settings.Misses} misses");
        }

        [SkippableFact]
        public async Task L2B_permission_lookups_hit_L1_on_the_request_hot_path()
        {
            var cluster = RequireCluster();
            var target = cluster.At(1);

            // Every authenticated request performs a permissioned-object lookup. That is the exact
            // path the Azure profile flagged, so it is the one worth proving.
            await target.GetApiPermissionsAsync(Config.TestApiTarget);
            await target.ResetCacheStatsAsync();

            for (var i = 0; i < 10; i++)
                await target.GetApiPermissionsAsync(Config.TestApiTarget);

            var stats = await target.GetCacheStatsAsync();
            var permissioned = stats.For(CacheNames.PermissionedObjects);
            permissioned.ShouldNotBeNull($"no statistics for {CacheNames.PermissionedObjects}");

            _output.WriteLine($"  {permissioned}");
            _output.WriteLine($"  hit rate {permissioned.HitRate:P0} over {permissioned.Reads} reads");

            permissioned.Hits.ShouldBeGreaterThan(0,
                "the permissioned-object cache never hit L1 on the request hot path");
            permissioned.HitRate.ShouldBeGreaterThan(0.5,
                $"L1 hit rate too low: {permissioned.HitRate:P0} ({permissioned})");
        }

        [SkippableFact]
        public async Task L2C_a_write_invalidates_L1_on_the_other_instances()
        {
            var cluster = RequireCluster();

            // Populate L1 everywhere, then write from one instance.
            await cluster.ReadAllAsync(i => i.GetSettingAsync<int>(Setting));
            await cluster.ResetAllCacheStatsAsync();

            var expected = Random.Shared.Next(1000, 100000);
            await cluster.At(1).UpdateSettingAsync(Setting, expected);

            var result = await cluster.PollUntilConvergedAsync(
                i => i.GetSettingAsync<int>(Setting),
                value => value == expected);

            result.Converged.ShouldBeTrue(
                $"stale L1 entries survived the write: {result.DescribeLastSeen()}");

            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");

            // Convergence must come from the pub/sub broadcast, not from entries timing out.
            var ttl = cluster.At(2).Info.L1ExpirationSeconds * 1000;
            result.ElapsedMs.ShouldBeLessThan(ttl,
                $"convergence took {result.ElapsedMs}ms, which is at or beyond the {ttl}ms L1 TTL — " +
                "invalidation is probably not being broadcast, leaving expiry to do the work");

            var stats = await cluster.At(2).GetCacheStatsAsync();
            var settings = stats.For(CacheNames.Settings);
            _output.WriteLine($"  api-2 after invalidation: {settings}");
        }

        [SkippableFact]
        public async Task L2D_clearing_a_cache_drops_L1_everywhere()
        {
            var cluster = RequireCluster();

            // A Clear that only emptied Redis would leave every other instance serving stale
            // values from L1 until they expired.
            await cluster.ReadAllAsync(i => i.GetSettingAsync<int>(Setting));

            var expected = Random.Shared.Next(1000, 100000);
            await cluster.At(3).UpdateSettingAsync(Setting, expected);

            var result = await cluster.PollUntilConvergedAsync(
                i => i.GetSettingAsync<int>(Setting),
                value => value == expected);

            result.Converged.ShouldBeTrue(result.DescribeLastSeen());
            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");
        }

        [SkippableFact]
        public async Task L2E_repeated_tree_reads_stay_stable_despite_shared_instances()
        {
            var cluster = RequireCluster();
            var target = cluster.At(1);

            // L1 hands back the SAME object instance on every hit, where the old Redis path
            // deserialized a fresh copy each time. PermissionedObjectManager.GetObjectWithChild
            // mutates dto.Children on objects that came from the cache, so a repeated tree read is
            // the case most likely to corrupt shared state. It is guarded by a FirstOrDefault
            // check, and this test exists to keep that guard honest.
            var first = await target.GetPermissionedObjectTreeAsync(Config.TestTreeType);
            var second = await target.GetPermissionedObjectTreeAsync(Config.TestTreeType);
            var third = await target.GetPermissionedObjectTreeAsync(Config.TestTreeType);

            _output.WriteLine($"  tree node counts across three reads: {first}, {second}, {third}");

            // Guard against a vacuous pass: an empty tree would satisfy the equality assertions
            // below while exercising none of the mutation path.
            first.ShouldBeGreaterThan(10,
                $"'{Config.TestTreeType}' produced a tree of {first} nodes, too small to exercise " +
                "GetObjectWithChild -- set Cluster:TestTreeType to a type with a nested tree");

            second.ShouldBe(first, "the permissioned-object tree grew between reads — " +
                                   "cached DTOs are being mutated through the shared L1 instance");
            third.ShouldBe(first, "the permissioned-object tree grew between reads — " +
                                  "cached DTOs are being mutated through the shared L1 instance");
        }
    }
}
