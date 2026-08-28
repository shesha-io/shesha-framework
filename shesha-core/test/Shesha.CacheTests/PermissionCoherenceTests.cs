using Shesha.CacheTests.Infrastructure;
using Shouldly;
using Xunit;
using Xunit.Abstractions;

namespace Shesha.CacheTests
{
    /// <summary>
    /// T4 / T5 / T6 -- permissioned object cache coherence.
    ///
    /// This is the cache the Azure profiler flagged: PermissionedObjectCache is read on every
    /// authenticated request (SheshaAuthorizationFilter -> ApiAuthorizationHelper ->
    /// ObjectPermissionChecker -> PermissionedObjectManager.GetInternalAsync).
    ///
    /// A stale entry here is not cosmetic -- it means an instance enforcing the wrong access
    /// level. These are the highest-value tests in the suite.
    /// </summary>
    public class PermissionCoherenceTests : ClusterTestBase
    {
        private const string UnheldPermission = "__cache_test_permission_that_nobody_has__";

        private readonly ITestOutputHelper _output;

        public PermissionCoherenceTests(ClusterFixture fixture, ITestOutputHelper output) : base(fixture)
        {
            _output = output;
        }

        private CacheTestConfig.ApiTarget Target => Config.TestApiTarget;

        private async Task<PermissionedAccess?> ReadAccessAsync(ClusterInstance instance)
        {
            var dto = await instance.GetApiPermissionsAsync(Target);
            return dto?.Access;
        }

        [SkippableFact]
        public async Task T4_access_change_on_instance_1_propagates_to_2_and_3()
        {
            var cluster = RequireCluster();

            await cluster.At(1).SetAccessAsync(Target, PermissionedAccess.AnyAuthenticated);

            var result = await cluster.PollUntilConvergedAsync(
                ReadAccessAsync,
                access => access == PermissionedAccess.AnyAuthenticated);

            result.Converged.ShouldBeTrue(
                $"access level did not converge within {result.ElapsedMs}ms. Saw: {result.DescribeLastSeen()}");

            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");
        }

        [SkippableFact]
        public async Task T5_restriction_applied_on_one_instance_is_seen_by_the_others()
        {
            var cluster = RequireCluster();

            // The behavioural consequence, not just the cached value. This is what actually breaks
            // in production if an L1 entry goes stale: one node still serving what another has
            // already locked down.
            await cluster.At(2).SetAccessAsync(
                Target,
                PermissionedAccess.RequiresPermissions,
                new[] { UnheldPermission });

            var result = await cluster.PollUntilConvergedAsync(
                ReadAccessAsync,
                access => access == PermissionedAccess.RequiresPermissions);

            result.Converged.ShouldBeTrue(
                $"restriction did not converge within {result.ElapsedMs}ms. Saw: {result.DescribeLastSeen()}");

            // Every instance must agree on the permission list, not merely the access level.
            var dtos = await cluster.ReadAllAsync(instance => instance.GetApiPermissionsAsync(Target));

            foreach (var dto in dtos)
            {
                dto.Permissions.ShouldNotBeNull($"{Target} returned no permission list");
                dto.Permissions.ShouldContain(UnheldPermission);
            }

            _output.WriteLine($"  converged in {result.ElapsedMs}ms ({result.DescribeTimings()})");
        }

        [SkippableFact]
        public async Task T6_concurrent_writes_from_all_instances_converge_on_one_value()
        {
            var cluster = RequireCluster();

            // Each instance writes a different access level simultaneously. Which one wins is a
            // race, but all three must agree on the winner -- divergence means a lost invalidation.
            var levels = new[]
            {
                PermissionedAccess.AnyAuthenticated,
                PermissionedAccess.RequiresPermissions,
                PermissionedAccess.Inherited,
            };

            await Task.WhenAll(cluster.Instances.Select((instance, i) =>
                instance.SetAccessAsync(Target, levels[i % levels.Length])));

            // Let the writes settle before demanding unanimity.
            await Task.Delay(TimeSpan.FromMilliseconds(500));

            var finalValues = await cluster.ReadAllAsync(ReadAccessAsync);
            _output.WriteLine($"  final access per instance: {string.Join(", ", finalValues)}");

            finalValues.Distinct().Count().ShouldBe(
                1, $"instances disagree on the final access level: {string.Join(", ", finalValues)}");
        }

        [SkippableFact]
        public async Task T4b_unknown_object_resolves_identically_on_all_instances()
        {
            var cluster = RequireCluster();

            // Negative caching: reading a non-existent object populates CacheItemWrapper.DefaultValue
            // on each instance independently. That wrapper's parameterized constructor is what
            // produces the CreateObjectUsingCreatorWithParameters frame in the Azure profile, and
            // it is the path most likely to diverge once an L1 layer exists.
            var phantom = $"Shesha.Cache.Test.NonExistentService.{Guid.NewGuid():N}";

            var resolved = await cluster.ReadAllAsync(async instance =>
            {
                try
                {
                    var dto = await instance.GetApiPermissionsAsync(phantom, "Get");
                    return dto is null ? "null" : $"{dto.Access}:{dto.ActualAccess}";
                }
                catch (Exception ex)
                {
                    return $"error:{ex.GetType().Name}";
                }
            });

            _output.WriteLine($"  phantom object resolved as: {string.Join(" | ", resolved)}");

            resolved.Distinct().Count().ShouldBe(
                1, $"instances disagree on an unknown object: {string.Join(" | ", resolved)}");
        }
    }
}
