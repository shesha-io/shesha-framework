using System.Diagnostics;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using DotNet.Testcontainers.Images;
using DotNet.Testcontainers.Networks;
using Testcontainers.MsSql;

namespace Shesha.CacheTests.Infrastructure.Provisioning
{
    /// <summary>
    /// Provisions the whole cluster -- SQL Server, Redis and N API instances -- so `dotnet test`
    /// is self-contained and needs nothing but Docker.
    ///
    /// Mirrors what docker-cache-test/up.ps1 does for local development, including the cold-start
    /// sequencing: instance 1 runs migrations and bootstrappers alone, and only once it is serving
    /// do the others start with those steps skipped. The framework guards seeding with a Redis
    /// distributed lock (SheshaNHibernateModule.cs:268) but that lock only waits 10s, far less
    /// than a cold start takes.
    ///
    /// Host ports are assigned by Docker rather than fixed, which also sidesteps the Windows
    /// reserved-port ranges that make fixed ports unreliable (netsh excludedportrange).
    /// </summary>
    public sealed class ClusterProvisioner : IAsyncDisposable
    {
        private const string SqlAlias = "sql";
        private const string RedisAlias = "redis";
        private const int AppPort = 8080;
        private const string SqlPassword = "Cache@Test1";
        private const string DatabaseName = "SheshaFunctionalTests";

        // Pinned so a token minted by one instance validates on the others. The suite asserts
        // this; drift would otherwise look like cache incoherence.
        private const string JwtKey = "ZQJK9FR81M9NDCKX161B2L9RXDBHL7GS";

        private readonly CacheTestConfig _config;
        private readonly Action<string> _log;

        private INetwork? _network;
        private MsSqlContainer? _sql;
        private IContainer? _redis;
        private readonly List<IContainer> _apps = new();

        public ClusterProvisioner(CacheTestConfig config, Action<string> log)
        {
            _config = config;
            _log = log;
        }

        /// <summary>Base URLs of the provisioned instances, in api-1..api-N order.</summary>
        public IReadOnlyList<string> BaseUrls { get; private set; } = Array.Empty<string>();

        public async Task ProvisionAsync(CancellationToken cancellationToken = default)
        {
            var total = Stopwatch.StartNew();

            var publishDir = ResolvePublishDirectory();
            await EnsurePublishedAsync(publishDir, cancellationToken);

            _network = new NetworkBuilder().Build();
            await _network.CreateAsync(cancellationToken);

            await StartSqlAsync(cancellationToken);
            await StartRedisAsync(cancellationToken);

            var image = await BuildAppImageAsync(publishDir, cancellationToken);
            await StartAppInstancesAsync(image, cancellationToken);

            BaseUrls = _apps
                .Select(app => $"http://{app.Hostname}:{app.GetMappedPublicPort(AppPort)}")
                .ToList();

            _log($"cluster provisioned in {total.Elapsed.TotalSeconds:F0}s -> {string.Join(", ", BaseUrls)}");
        }

        // --- SQL ---------------------------------------------------------------------------

        private async Task StartSqlAsync(CancellationToken cancellationToken)
        {
            var sw = Stopwatch.StartNew();

            _sql = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .WithPassword(SqlPassword)
                .WithNetwork(_network)
                .WithNetworkAliases(SqlAlias)
                .Build();

            await _sql.StartAsync(cancellationToken);
            _log($"sql up in {sw.ElapsedMilliseconds}ms");

            // A .bacpac cannot be RESTOREd; DacFx imports it. Keeps the 325 KB bacpac as the single
            // database artifact in git, with no custom SQL image and no sqlpackage on the agent.
            sw.Restart();
            var bacpac = BacpacImporter.ResolveBacpacPath(_config.BacpacPath);
            await BacpacImporter.ImportAsync(
                _sql.GetConnectionString(), bacpac, DatabaseName, _log,
                _config.VerboseProvisioning, cancellationToken);
            _log($"bacpac imported in {sw.ElapsedMilliseconds}ms");
        }

        /// <summary>Connection string as seen from inside the docker network, not the host.</summary>
        private static string InNetworkConnectionString() =>
            $"Data Source={SqlAlias},1433;Initial Catalog={DatabaseName};User Id=sa;" +
            $"Password={SqlPassword};TrustServerCertificate=True;Encrypt=False;";

        // --- Redis -------------------------------------------------------------------------

        private async Task StartRedisAsync(CancellationToken cancellationToken)
        {
            _redis = new ContainerBuilder()
                .WithImage("redis:7-alpine")
                .WithNetwork(_network)
                .WithNetworkAliases(RedisAlias)
                // No persistence: every provision starts from a genuinely cold cache.
                .WithCommand("redis-server", "--save", "", "--appendonly", "no")
                .WithWaitStrategy(Wait.ForUnixContainer().UntilCommandIsCompleted("redis-cli", "ping"))
                .Build();

            await _redis.StartAsync(cancellationToken);
            _log("redis up");
        }

        // --- application ------------------------------------------------------------------

        private async Task<IFutureDockerImage> BuildAppImageAsync(
            string publishDir, CancellationToken cancellationToken)
        {
            // Reuses the same Dockerfile as the compose stack so the two paths cannot drift in how
            // the app is packaged. Its build context is the docker-cache-test folder, which is
            // where publish output lives.
            var contextDir = Directory.GetParent(publishDir)!.FullName;

            var image = new ImageFromDockerfileBuilder()
                .WithDockerfileDirectory(contextDir)
                .WithDockerfile("Dockerfile")
                .WithName("sha-cache-test-api:testcontainers")
                .WithCleanUp(false)
                .Build();

            var sw = Stopwatch.StartNew();
            await image.CreateAsync(cancellationToken);
            _log($"app image built in {sw.ElapsedMilliseconds}ms");
            return image;
        }

        private async Task StartAppInstancesAsync(
            IFutureDockerImage image, CancellationToken cancellationToken)
        {
            var count = Math.Max(2, _config.InstanceCount);

            // Instance 1 alone first: it applies pending migrations AND runs the bootstrappers that
            // populate Frwk_PermissionedObjects. The bacpac ships that table's schema but no rows,
            // so this step is what creates the endpoint the permission tests target.
            var first = BuildAppContainer(image, index: 1, skipStartupWork: false);
            var sw = Stopwatch.StartNew();
            await first.StartAsync(cancellationToken);
            _apps.Add(first);
            _log($"api-1 ready in {sw.ElapsedMilliseconds}ms (migrations + bootstrappers)");

            // The rest can then start together with that work skipped.
            var rest = Enumerable.Range(2, count - 1)
                .Select(i => BuildAppContainer(image, i, skipStartupWork: true))
                .ToList();

            sw.Restart();
            await Task.WhenAll(rest.Select(c => c.StartAsync(cancellationToken)));
            _apps.AddRange(rest);
            _log($"api-2..api-{count} ready in {sw.ElapsedMilliseconds}ms");
        }

        private IContainer BuildAppContainer(IFutureDockerImage image, int index, bool skipStartupWork)
        {
            var builder = new ContainerBuilder()
                .WithImage(image)
                .WithNetwork(_network)
                .WithNetworkAliases($"api-{index}")
                .WithPortBinding(AppPort, assignRandomHostPort: true)
                .WithEnvironment("ASPNETCORE_ENVIRONMENT", "Development")
                .WithEnvironment("ASPNETCORE_URLS", $"http://+:{AppPort}")
                .WithEnvironment("ConnectionStrings__Default", InNetworkConnectionString())
                .WithEnvironment("SheshaRedis__ConnectionString", $"{RedisAlias}:6379")
                .WithEnvironment("SheshaRedis__DatabaseId", "0")
                .WithEnvironment("Authentication__JwtBearer__SecurityKey", JwtKey)
                .WithEnvironment("Authentication__JwtBearer__Issuer", "Shesha")
                .WithEnvironment("Authentication__JwtBearer__Audience", "Shesha")
                // Duplicate scheduled-job execution across instances would add noise to timings.
                .WithEnvironment("Hangfire__Enabled", "false")
                .WithEnvironment("DOTNET_SYSTEM_GLOBALIZATION_INVARIANT", "false")
                .WithEnvironment("INSTANCE_ID", $"api-{index}")
                .WithWaitStrategy(Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(request => request
                    .ForPath("/api/cache-diagnostics/instance")
                    .ForPort(AppPort)
                    .ForStatusCode(System.Net.HttpStatusCode.OK)))
                .WithStartupCallback((_, _) => Task.CompletedTask);

            if (skipStartupWork)
            {
                builder = builder
                    .WithEnvironment("skipMigrations", "true")
                    .WithEnvironment("skipBootstrappers", "true");
            }

            return builder.Build();
        }

        // --- publish output ---------------------------------------------------------------

        /// <summary>
        /// The app image is built from published binaries, so the publish must exist. Producing it
        /// here rather than in a pipeline step is what lets `dotnet test` stand alone.
        /// </summary>
        private async Task EnsurePublishedAsync(string publishDir, CancellationToken cancellationToken)
        {
            var marker = Path.Combine(publishDir, "Shesha.CacheTests.Host.dll");
            if (File.Exists(marker) && !_config.AlwaysPublish)
            {
                _log($"using existing publish output: {publishDir}");
                return;
            }

            var project = ResolveWebHostProject();
            _log($"publishing {Path.GetFileName(project)} -> {publishDir} (this takes a minute) ...");

            var sw = Stopwatch.StartNew();
            var psi = new ProcessStartInfo("dotnet")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            };
            psi.ArgumentList.Add("publish");
            psi.ArgumentList.Add(project);
            psi.ArgumentList.Add("-c");
            psi.ArgumentList.Add("Release");
            psi.ArgumentList.Add("-o");
            psi.ArgumentList.Add(publishDir);

            using var process = Process.Start(psi)
                ?? throw new InvalidOperationException("Failed to start dotnet publish.");

            var stdout = await process.StandardOutput.ReadToEndAsync(cancellationToken);
            var stderr = await process.StandardError.ReadToEndAsync(cancellationToken);
            await process.WaitForExitAsync(cancellationToken);

            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException(
                    $"dotnet publish failed ({process.ExitCode}).{Environment.NewLine}" +
                    $"{Tail(stdout)}{Environment.NewLine}{Tail(stderr)}");
            }

            _log($"publish complete in {sw.Elapsed.TotalSeconds:F0}s");
        }

        private static string Tail(string value)
        {
            var lines = value.Split('\n');
            return string.Join("\n", lines.TakeLast(15));
        }

        private string ResolvePublishDirectory() =>
            Path.Combine(FindRigDirectory(), "publish");

        private static string ResolveWebHostProject()
        {
            // The purpose-built cache-test host, not the functional-test application: the
            // diagnostics endpoints and the no-background-workers policy live there, leaving
            // Boxfusion.SheshaFunctionalTests.Web.Host untouched.
            var root = FindRepoRoot();
            var project = Path.Combine(root, "shesha-core", "test",
                "Shesha.CacheTests.Host", "Shesha.CacheTests.Host.csproj");

            return File.Exists(project)
                ? project
                : throw new FileNotFoundException($"Cache-test host project not found at {project}");
        }

        private static string FindRigDirectory()
        {
            var dir = Path.Combine(FindRepoRoot(), "shesha-core", "test", "docker-cache-test");
            return Directory.Exists(dir)
                ? dir
                : throw new DirectoryNotFoundException($"docker-cache-test folder not found at {dir}");
        }

        private static string FindRepoRoot()
        {
            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir is not null)
            {
                if (Directory.Exists(Path.Combine(dir.FullName, "shesha-functional-tests")))
                    return dir.FullName;
                dir = dir.Parent;
            }

            throw new DirectoryNotFoundException(
                "Could not locate the repository root (no shesha-functional-tests folder found above " +
                AppContext.BaseDirectory + ").");
        }

        // --- teardown ---------------------------------------------------------------------

        public async ValueTask DisposeAsync()
        {
            foreach (var app in _apps)
                await SafeDisposeAsync(app);
            _apps.Clear();

            if (_redis is not null) await SafeDisposeAsync(_redis);
            if (_sql is not null) await SafeDisposeAsync(_sql);
            if (_network is not null)
            {
                try { await _network.DeleteAsync(); } catch { /* best effort */ }
                await _network.DisposeAsync();
            }
        }

        private static async Task SafeDisposeAsync(IAsyncDisposable disposable)
        {
            try { await disposable.DisposeAsync(); }
            catch { /* teardown must not mask a test result */ }
        }
    }
}
