using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Shesha.Controllers;
using Shesha.Redis.Caching;

namespace Shesha.CacheTests.Host.Controllers
{
    /// <summary>
    /// Diagnostics for the multi-instance cache test rig (shesha-core/test/docker-cache-test).
    ///
    /// TEST HOST ONLY — this deliberately lives outside the framework. It exists so the
    /// cache-coherence suite can (a) prove which instance answered a request and (b) inspect
    /// cache state directly, rather than inferring both from timing.
    ///
    /// Once the L1 cache lands, <see cref="PeekAsync"/> gains an L1 hit/miss view and
    /// <see cref="ResetStatsAsync"/> becomes meaningful. Until then this reports Redis only.
    /// </summary>
    [Route("api/cache-diagnostics")]
    public class CacheDiagnosticsController : SheshaControllerBase
    {
        private static readonly DateTime ProcessStartedUtc = ResolveProcessStart();

        private readonly IIocResolver _iocResolver;
        private readonly IMultiTenancyConfig _multiTenancyConfig;
        private readonly IWebHostEnvironment _hostEnvironment;

        public CacheDiagnosticsController(
            IIocResolver iocResolver,
            IMultiTenancyConfig multiTenancyConfig,
            IWebHostEnvironment hostEnvironment)
        {
            _iocResolver = iocResolver;
            _multiTenancyConfig = multiTenancyConfig;
            _hostEnvironment = hostEnvironment;
        }

        /// <summary>
        /// Identifies the instance that served this request.
        ///
        /// Anonymous by design: the startup script polls this as a readiness probe, and the
        /// test suite calls it before authenticating to map ports to instance identities.
        /// </summary>
        [HttpGet("instance")]
        [AllowAnonymous]
        public IActionResult GetInstance()
        {
            return Ok(new InstanceInfo
            {
                InstanceId = Environment.GetEnvironmentVariable("INSTANCE_ID") ?? "(unset)",
                MachineName = Environment.MachineName,
                ProcessId = Environment.ProcessId,
                StartedUtc = ProcessStartedUtc,
                UptimeSeconds = (int)(DateTime.UtcNow - ProcessStartedUtc).TotalSeconds,
                BuildSha = ReadBuildSha(),
                RedisConfigured = _iocResolver.IsRegistered<IShaRedisCacheDatabaseProvider>(),
                L1Enabled = TryGetOptions()?.L1Enabled ?? false,
                L1ExpirationSeconds = TryGetOptions()?.L1ExpirationSeconds ?? 0,
                InvalidationBusConnected = TryGetBusConnected(),
            });
        }

        /// <summary>
        /// Inspects a single cache entry as it exists in Redis right now.
        ///
        /// The suite uses this to distinguish "the value propagated" from "the value was
        /// never written", which timing alone cannot tell apart.
        /// </summary>
        /// <param name="cacheName">ABP cache name, e.g. "PermissionedObjectCache".</param>
        /// <param name="key">Un-normalized cache key.</param>
        [HttpGet("peek")]
        public async Task<IActionResult> PeekAsync([FromQuery] string cacheName, [FromQuery] string key)
        {
            if (string.IsNullOrWhiteSpace(cacheName) || string.IsNullOrWhiteSpace(key))
                return BadRequest("cacheName and key are both required.");

            if (!_iocResolver.IsRegistered<IShaRedisCacheDatabaseProvider>())
                return Ok(new PeekResult { CacheName = cacheName, Key = key, RedisConfigured = false });

            // Resolved lazily rather than constructor-injected so the controller still works
            // when the host runs without Redis configured (the normal dev workflow).
            using var providerScope = _iocResolver.ResolveAsDisposable<IShaRedisCacheDatabaseProvider>();
            using var normalizerScope = _iocResolver.ResolveAsDisposable<IShaRedisCacheKeyNormalizer>();

            var normalizedKey = normalizerScope.Object.NormalizeKey(
                new ShaRedisCacheKeyNormalizeArgs(key, cacheName, _multiTenancyConfig.IsEnabled));

            var db = providerScope.Object.GetDatabase();
            var value = await db.StringGetAsync(normalizedKey);
            var ttl = await db.KeyTimeToLiveAsync(normalizedKey);

            return Ok(new PeekResult
            {
                CacheName = cacheName,
                Key = key,
                NormalizedKey = normalizedKey,
                RedisConfigured = true,
                ExistsInRedis = value.HasValue,
                PayloadBytes = value.HasValue ? ((string)value!).Length : 0,
                TtlSeconds = ttl?.TotalSeconds,
                Payload = value.HasValue ? (string)value! : null,
            });
        }

        /// <summary>
        /// L1 hit/miss counters per named cache.
        ///
        /// This is what turns "the cache seems faster" into evidence: the suite resets the
        /// counters, issues repeat reads, and asserts the hits actually landed in L1 rather than
        /// going to Redis.
        /// </summary>
        [HttpGet("cache-stats")]
        public IActionResult GetCacheStats()
        {
            if (!_iocResolver.IsRegistered<IShaCacheStatistics>())
                return Ok(new CacheStatsResult { Available = false });

            using var scope = _iocResolver.ResolveAsDisposable<IShaCacheStatistics>();
            var snapshot = scope.Object.GetSnapshot();

            return Ok(new CacheStatsResult
            {
                Available = true,
                Caches = snapshot.Values
                    .OrderByDescending(x => x.Hits + x.Misses)
                    .Select(x => new CacheStatsEntry
                    {
                        CacheName = x.CacheName,
                        Hits = x.Hits,
                        Misses = x.Misses,
                        Invalidations = x.Invalidations,
                        OverflowPurges = x.OverflowPurges,
                        Entries = x.Entries,
                        HitRate = x.HitRate,
                    })
                    .ToList(),
            });
        }

        /// <summary>Zeroes the L1 counters so a measurement can be isolated.</summary>
        [HttpPost("reset-stats")]
        public IActionResult ResetStats()
        {
            if (!_iocResolver.IsRegistered<IShaCacheStatistics>())
                return Ok(new { reset = false, reason = "cache statistics not available" });

            using var scope = _iocResolver.ResolveAsDisposable<IShaCacheStatistics>();
            scope.Object.Reset();
            return Ok(new { reset = true });
        }

        private ShaRedisCacheOptions? TryGetOptions()
        {
            if (!_iocResolver.IsRegistered<ShaRedisCacheOptions>())
                return null;

            using var scope = _iocResolver.ResolveAsDisposable<ShaRedisCacheOptions>();
            return scope.Object;
        }

        private bool TryGetBusConnected()
        {
            if (!_iocResolver.IsRegistered<IShaCacheInvalidationBus>())
                return false;

            using var scope = _iocResolver.ResolveAsDisposable<IShaCacheInvalidationBus>();
            return scope.Object.IsConnected;
        }

        private string? ReadBuildSha()
        {
            try
            {
                var path = Path.Combine(_hostEnvironment.ContentRootPath, "BUILD_SHA.txt");
                return System.IO.File.Exists(path) ? System.IO.File.ReadAllText(path).Trim() : null;
            }
            catch
            {
                return null;
            }
        }

        private static DateTime ResolveProcessStart()
        {
            try
            {
                return Process.GetCurrentProcess().StartTime.ToUniversalTime();
            }
            catch
            {
                // Process start time is not always readable in a container; uptime is only
                // informational so fall back rather than failing the readiness probe.
                return DateTime.UtcNow;
            }
        }

        public class InstanceInfo
        {
            public string? InstanceId { get; set; }
            public string? MachineName { get; set; }
            public int ProcessId { get; set; }
            public DateTime StartedUtc { get; set; }
            public int UptimeSeconds { get; set; }
            public string? BuildSha { get; set; }
            public bool RedisConfigured { get; set; }
            public bool L1Enabled { get; set; }
            public int L1ExpirationSeconds { get; set; }
            public bool InvalidationBusConnected { get; set; }
        }

        public class CacheStatsResult
        {
            public bool Available { get; set; }
            public List<CacheStatsEntry> Caches { get; set; } = new();
        }

        public class CacheStatsEntry
        {
            public string? CacheName { get; set; }
            public long Hits { get; set; }
            public long Misses { get; set; }
            public long Invalidations { get; set; }
            public long OverflowPurges { get; set; }
            public int Entries { get; set; }
            public double HitRate { get; set; }
        }

        public class PeekResult
        {
            public string? CacheName { get; set; }
            public string? Key { get; set; }
            public string? NormalizedKey { get; set; }
            public bool RedisConfigured { get; set; }
            public bool ExistsInRedis { get; set; }
            public int PayloadBytes { get; set; }
            public double? TtlSeconds { get; set; }
            public string? Payload { get; set; }
        }
    }
}
