using Shesha.CacheTests.Infrastructure;
using Shouldly;
using Xunit;
using Xunit.Abstractions;

namespace Shesha.CacheTests
{
    /// <summary>
    /// T1 / T2 / T3 -- settings cache coherence.
    ///
    /// The write path invalidates via SettingStore.HandleEventAsync, which removes the key from
    /// the SHARED Redis store. With no in-process layer today, that removal is visible to every
    /// instance the instant it happens.
    ///
    /// Adding an L1 cache breaks that guarantee and replaces it with bounded staleness. These
    /// tests measure the guarantee now and hold the line afterwards.
    /// </summary>
    public class SettingsCoherenceTests : ClusterTestBase
    {
        private readonly ITestOutputHelper _output;

        public SettingsCoherenceTests(ClusterFixture fixture, ITestOutputHelper output) : base(fixture)
        {
            _output = output;
        }

        private CacheTestConfig.SettingIdentifier Setting => Config.TestSetting;

        private Task<int> ReadAsync(ClusterInstance instance) => instance.GetSettingAsync<int>(Setting);

        [SkippableFact]
        public async Task T2_write_is_immediately_visible_on_the_writing_instance()
        {
            var cluster = RequireCluster();
            var target = cluster.At(1);
            var expected = NextValue();

            await target.UpdateSettingAsync(Setting, expected);
            var readBack = await ReadAsync(target);

            // Catches an L1 layer that invalidates remotely but forgets its own local copy -- the
            // easiest bug to introduce and the most confusing to diagnose in production.
            readBack.ShouldBe(expected);
        }

        [SkippableFact]
        public async Task T1_write_on_instance_1_becomes_visible_on_2_and_3()
        {
            var cluster = RequireCluster();
            var expected = NextValue();

            await cluster.At(1).UpdateSettingAsync(Setting, expected);

            var result = await cluster.PollUntilConvergedAsync(ReadAsync, value => value == expected);

            result.Converged.ShouldBeTrue(
                $"setting did not converge within {result.ElapsedMs}ms. " +
                $"Expected {expected}, saw: {result.DescribeLastSeen()}");

            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");
        }

        [SkippableFact]
        public async Task T1b_write_on_instance_3_becomes_visible_on_1_and_2()
        {
            var cluster = RequireCluster();
            var expected = NextValue();

            // Direction matters: invalidation must work from any node, not just the first.
            await cluster.At(3).UpdateSettingAsync(Setting, expected);

            var result = await cluster.PollUntilConvergedAsync(ReadAsync, value => value == expected);

            result.Converged.ShouldBeTrue(
                $"setting did not converge within {result.ElapsedMs}ms. " +
                $"Expected {expected}, saw: {result.DescribeLastSeen()}");

            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");
        }

        [SkippableFact]
        public async Task T3_convergence_latency_across_repeated_writes()
        {
            var cluster = RequireCluster();

            // Produces the number that should drive the L1 TTL decision. On the current build this
            // is expected to be near request latency; the point is to have it on record before
            // anything changes.
            const int rounds = 5;
            var samples = new List<long>();

            for (var i = 0; i < rounds; i++)
            {
                var expected = NextValue();
                var writer = cluster.At((i % cluster.Instances.Count) + 1);

                await writer.UpdateSettingAsync(Setting, expected);

                var result = await cluster.PollUntilConvergedAsync(
                    ReadAsync,
                    value => value == expected,
                    interval: TimeSpan.FromMilliseconds(25));

                result.Converged.ShouldBeTrue(
                    $"round {i + 1} (writer api-{writer.Index}) did not converge: {result.DescribeLastSeen()}");

                samples.Add(result.ElapsedMs);
            }

            samples.Sort();
            var median = samples[samples.Count / 2];
            var max = samples[^1];

            _output.WriteLine($"  convergence over {rounds} rounds -- median {median}ms, max {max}ms");
            _output.WriteLine($"  samples: {string.Join(", ", samples)}ms");

            // Recorded rather than bounded tightly: this is a measurement, and a tight threshold
            // would just be flaky on a loaded developer machine.
            max.ShouldBeLessThan(15000);
        }

        [SkippableFact]
        public async Task Cached_entry_is_present_in_redis_after_a_read()
        {
            var cluster = RequireCluster();

            // Distinguishes "the value propagated" from "the cache was never populated" -- the
            // behavioural tests above cannot tell those apart on their own.
            await ReadAsync(cluster.At(1));

            var peeked = await cluster.At(1).PeekAsync(CacheNames.Settings, Setting.CacheKey);

            _output.WriteLine(
                $"  peek {CacheNames.Settings}[{Setting.CacheKey}] -> normalized={peeked.NormalizedKey} " +
                $"exists={peeked.ExistsInRedis} bytes={peeked.PayloadBytes}");

            peeked.RedisConfigured.ShouldBeTrue();
            peeked.ExistsInRedis.ShouldBeTrue(
                $"no Redis entry for {Setting.CacheKey}; the cache key shape may have changed");
        }

        /// <summary>A distinct value per call, so a stale read is always distinguishable from a fresh one.</summary>
        private static int NextValue() => Random.Shared.Next(1000, 100000);
    }
}
