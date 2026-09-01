using Shesha.CacheTests.Infrastructure;
using Shouldly;
using Xunit;
using Xunit.Abstractions;

namespace Shesha.CacheTests
{
    /// <summary>
    /// T0 -- cluster sanity.
    ///
    /// Everything downstream assumes three genuinely distinct instances sharing one Redis and one
    /// database, with a common JWT signing key. If any of that is untrue the coherence tests
    /// produce meaningless results -- passes as well as failures. These assertions exist so that
    /// misconfiguration fails loudly and specifically instead of looking like a cache bug.
    /// </summary>
    public class ClusterSanityTests : ClusterTestBase
    {
        private readonly ITestOutputHelper _output;

        public ClusterSanityTests(ClusterFixture fixture, ITestOutputHelper output) : base(fixture)
        {
            _output = output;
        }

        [SkippableFact]
        public void All_configured_instances_respond()
        {
            var cluster = RequireCluster();

            _output.WriteLine(Config.Describe());

            // In managed mode this is where provisioning timings surface -- SQL start, bacpac
            // import, image build and per-instance boot. Invaluable when a CI run is slow.
            if (Fixture.ProvisionLog.Count > 0)
            {
                _output.WriteLine("");
                foreach (var line in Fixture.ProvisionLog)
                    _output.WriteLine($"  [provision] {line}");
                _output.WriteLine("");
            }

            foreach (var instance in cluster.Instances)
            {
                _output.WriteLine(
                    $"  api-{instance.Index}  {instance.BaseUrl}  id={instance.Info.InstanceId}  " +
                    $"host={instance.Info.MachineName}  sha={instance.Info.BuildSha ?? "n/a"}  " +
                    $"uptime={instance.Info.UptimeSeconds}s");
            }

            cluster.Instances.Count.ShouldBe(Config.BaseUrls.Length);
        }

        [SkippableFact]
        public void Instances_are_distinct_processes()
        {
            var cluster = RequireCluster();

            // Containers all report PID 1, so identity is host name plus PID.
            Should.NotThrow(() => cluster.AssertDistinctInstances());
        }

        [SkippableFact]
        public void Every_instance_has_redis_configured()
        {
            var cluster = RequireCluster();

            foreach (var instance in cluster.Instances)
                instance.Info.RedisConfigured.ShouldBeTrue($"{instance} has no Redis configured");
        }

        [SkippableFact]
        public void All_instances_run_the_same_build()
        {
            var cluster = RequireCluster();

            // A mixed-build cluster makes before/after comparison meaningless.
            var shas = cluster.Instances.Select(x => x.Info.BuildSha).Distinct().ToList();
            shas.Count.ShouldBe(1, $"instances report different builds: {string.Join(", ", shas)}");
        }

        [SkippableFact]
        public async Task Token_from_instance_1_is_accepted_by_every_instance()
        {
            var cluster = RequireCluster();

            // ClusterClient authenticated once against instance 1 and reuses that token, so a
            // successful authenticated call on 2 and 3 proves the JWT signing keys match.
            var results = await cluster.ReadAllAsync(async instance =>
            {
                try
                {
                    await instance.PeekAsync(CacheNames.Settings, "__jwt_probe__");
                    return (instance.Index, Ok: true, Error: (string?)null);
                }
                catch (Exception ex)
                {
                    return (instance.Index, Ok: false, Error: ex.Message);
                }
            });

            foreach (var (index, ok, error) in results)
                ok.ShouldBeTrue($"api-{index} rejected the token from api-1: {error}");
        }
    }
}
