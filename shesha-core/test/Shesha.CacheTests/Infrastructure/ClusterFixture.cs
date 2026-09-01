using System.Text.Json.Nodes;
using Shesha.CacheTests.Infrastructure.Provisioning;
using Xunit;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// Shared setup for the whole suite: connects to the cluster once, snapshots the state the
    /// tests mutate, and restores it afterwards so repeated runs stay comparable.
    ///
    /// Never throws from <see cref="InitializeAsync"/>. If the rig is not running, the failure is
    /// recorded in <see cref="SkipReason"/> and every test skips with an actionable message —
    /// otherwise a plain `dotnet test` over the solution would fail for everyone who has not
    /// started Docker.
    /// </summary>
    public sealed class ClusterFixture : IAsyncLifetime
    {
        public CacheTestConfig Config { get; } = CacheTestConfig.Load();

        public ClusterClient? Cluster { get; private set; }

        /// <summary>Non-null when the cluster is unavailable; tests use it as the skip message.</summary>
        public string? SkipReason { get; private set; }

        private object? _originalSettingValue;
        private JsonObject? _originalPermissionedObject;
        private ClusterProvisioner? _provisioner;
        private readonly List<string> _provisionLog = new();

        /// <summary>Provisioning progress, surfaced by T0 so a slow or failed startup is visible.</summary>
        public IReadOnlyList<string> ProvisionLog => _provisionLog;

        public ClusterClient Require() =>
            Cluster ?? throw new InvalidOperationException(SkipReason ?? "Cluster is unavailable.");

        public async Task InitializeAsync()
        {
            try
            {
                // Managed mode brings up SQL + Redis + the API instances so `dotnet test` needs
                // nothing but Docker. External mode connects to an already-running stack, keeping
                // the local edit-and-rerun loop fast.
                if (Config.Provision)
                {
                    _provisioner = new ClusterProvisioner(Config, Log);
                    await _provisioner.ProvisionAsync();
                    Config.BaseUrls = _provisioner.BaseUrls.ToArray();
                }

                Cluster = await ClusterClient.ConnectAsync(Config);

                // Snapshot before any test mutates anything.
                _originalSettingValue = await Cluster.At(1).GetSettingAsync<object>(Config.TestSetting);
                _originalPermissionedObject = await Cluster.At(1)
                    .SnapshotApiPermissionsAsync(Config.TestApiTarget);
            }
            catch (Exception ex)
            {
                Cluster?.Dispose();
                Cluster = null;

                if (_provisioner is not null)
                {
                    await _provisioner.DisposeAsync();
                    _provisioner = null;
                }

                SkipReason = Config.Provision
                    ? $"Failed to provision the cache test cluster ({ex.GetType().Name}: {ex.Message}). " +
                      $"Docker must be running. Provisioning log:{Environment.NewLine}  " +
                      string.Join(Environment.NewLine + "  ", _provisionLog)
                    : $"Cache test cluster unavailable ({ex.GetType().Name}: {ex.Message}). " +
                      $"Start it with shesha-core/test/docker-cache-test/up.ps1, " +
                      $"or set Cluster:Provision=true to have the tests start it. " +
                      $"Configured instances: {string.Join(", ", Config.BaseUrls)}";
            }
        }

        public async Task DisposeAsync()
        {
            if (Cluster is null)
                return;

            try
            {
                if (_originalPermissionedObject is not null)
                    await Cluster.At(1).RestoreAsync(_originalPermissionedObject);

                if (_originalSettingValue is not null)
                    await Cluster.At(1).UpdateSettingAsync(Config.TestSetting, _originalSettingValue);
            }
            catch
            {
                // Best-effort restore; a failure here must not mask a genuine test result.
            }
            finally
            {
                Cluster.Dispose();
                Cluster = null;

                // Only tear down what we created; an external stack must survive the test run.
                if (_provisioner is not null)
                {
                    await _provisioner.DisposeAsync();
                    _provisioner = null;
                }
            }
        }

        private void Log(string message)
        {
            // xUnit has no output sink during fixture initialisation, so buffer for T0 to print.
            _provisionLog.Add(message);
            Console.WriteLine($"[cluster] {message}");
        }
    }

    /// <summary>
    /// Single collection for the entire suite.
    ///
    /// Parallelisation is DISABLED because every test mutates the same shared setting and
    /// permissioned object. Running two of them at once would make each other's writes look like
    /// cache incoherence.
    /// </summary>
    [CollectionDefinition(Name, DisableParallelization = true)]
    public sealed class ClusterCollection : ICollectionFixture<ClusterFixture>
    {
        public const string Name = "cluster";
    }

    /// <summary>Base class wiring up the fixture and the skip guard.</summary>
    [Collection(ClusterCollection.Name)]
    public abstract class ClusterTestBase
    {
        protected ClusterFixture Fixture { get; }

        protected CacheTestConfig Config => Fixture.Config;

        protected ClusterTestBase(ClusterFixture fixture)
        {
            Fixture = fixture;
        }

        /// <summary>Call at the top of every test; skips rather than fails when the rig is down.</summary>
        protected ClusterClient RequireCluster()
        {
            Skip.If(Fixture.SkipReason is not null, Fixture.SkipReason);
            return Fixture.Require();
        }
    }
}
