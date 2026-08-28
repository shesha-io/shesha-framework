using Microsoft.Extensions.Configuration;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// Configuration for the cache-coherence suite.
    ///
    /// Loaded from appsettings.json and overridable by environment variables prefixed SHA_, so a
    /// CI run and a local run differ only by environment. For example:
    ///   SHA_Cluster__BaseUrls__0=http://host-a:8080
    ///   SHA_Cluster__Password=...
    /// </summary>
    public sealed class CacheTestConfig
    {
        public const string EnvPrefix = "SHA_";

        /// <summary>Base URL per instance, in stable order. Index 0 is api-1.</summary>
        public string[] BaseUrls { get; set; } = Array.Empty<string>();

        /// <summary>nginx round-robin front end. Throughput tests only, never coherence tests.</summary>
        public string LoadBalancerUrl { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// When true the fixture provisions SQL + Redis + the API instances itself via
        /// Testcontainers, so `dotnet test` needs nothing but Docker. When false it connects to a
        /// cluster already running at <see cref="BaseUrls"/> (started by shesha-core/test/docker-cache-test/up.ps1),
        /// which keeps the local edit-and-rerun loop fast.
        /// </summary>
        public bool Provision { get; set; }

        /// <summary>Number of API instances to provision. Coherence needs at least two.</summary>
        public int InstanceCount { get; set; } = 3;

        /// <summary>Explicit bacpac path; discovered under shesha-functional-tests/database if unset.</summary>
        public string? BacpacPath { get; set; }

        /// <summary>Force `dotnet publish` even when publish output already exists.</summary>
        public bool AlwaysPublish { get; set; }

        /// <summary>
        /// Emit DacFx's per-statement output during the bacpac import. Off by default: it is
        /// hundreds of lines for this schema and buries the provisioning timings.
        /// </summary>
        public bool VerboseProvisioning { get; set; }

        public SettingIdentifier TestSetting { get; set; } = new();

        public ApiTarget TestApiTarget { get; set; } = new();

        /// <summary>
        /// Permissioned-object type used by the L1 shared-instance test. Must be a type whose
        /// GetAllTree response is genuinely nested -- a flat or empty result would make that test
        /// pass without exercising anything.
        /// </summary>
        public string TestTreeType { get; set; } = "Shesha.WebApi";

        public static CacheTestConfig Load()
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false)
                .AddEnvironmentVariables(EnvPrefix)
                .Build();

            var config = new CacheTestConfig();
            configuration.GetSection("Cluster").Bind(config);
            return config;
        }

        public string Describe() => string.Join(
            Environment.NewLine,
            $"mode:       {(Provision ? "managed (Testcontainers)" : "external (already running)")}",
            $"instances:  {string.Join(", ", BaseUrls)}",
            $"setting:    {TestSetting.Module}.{TestSetting.Name}",
            $"api target: {TestApiTarget.ServiceName}@{TestApiTarget.ActionName}");

        public sealed class SettingIdentifier
        {
            public string Module { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;

            /// <summary>Cache key used by SettingStore for a non client- or user-specific setting.</summary>
            public string CacheKey => $"{Module}.{Name}";
        }

        public sealed class ApiTarget
        {
            public string ServiceName { get; set; } = string.Empty;
            public string ActionName { get; set; } = string.Empty;

            public override string ToString() => $"{ServiceName}@{ActionName}";
        }
    }

    /// <summary>ABP cache store names, for diagnostics peek calls.</summary>
    public static class CacheNames
    {
        public const string Settings = "SettingsCache";
        public const string PermissionedObjects = "PermissionedObjectCache";
    }
}
