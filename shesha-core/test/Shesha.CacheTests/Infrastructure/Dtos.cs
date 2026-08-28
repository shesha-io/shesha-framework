using System.Text.Json.Serialization;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>Shesha.Domain.Enums.RefListPermissionedAccess</summary>
    public enum PermissionedAccess
    {
        Disable = 1,
        Inherited = 2,
        AnyAuthenticated = 3,
        RequiresPermissions = 4,
        AllowAnonymous = 5,
    }

    /// <summary>The ABP result envelope wrapped around every app-service response.</summary>
    public sealed class AbpResponse<T>
    {
        public T? Result { get; set; }
        public string? TargetUrl { get; set; }
        public bool Success { get; set; }
        public AbpError? Error { get; set; }
        public bool UnAuthorizedRequest { get; set; }
    }

    public sealed class AbpError
    {
        public int Code { get; set; }
        public string? Message { get; set; }
        public string? Details { get; set; }

        public override string ToString() =>
            string.IsNullOrWhiteSpace(Details) ? Message ?? "(no detail)" : $"{Message}: {Details}";
    }

    public sealed class AuthenticateResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public long ExpireInSeconds { get; set; }
        public long UserId { get; set; }
    }

    /// <summary>
    /// Subset of Shesha.Permissions.PermissionedObjectDto needed for assertions.
    ///
    /// Reads deserialize into this; WRITES go through the raw JsonObject so that fields not
    /// modelled here are round-tripped verbatim rather than silently reset to null.
    /// </summary>
    public sealed class PermissionedObjectDto
    {
        public Guid Id { get; set; }

        [JsonPropertyName("object")]
        public string? Object { get; set; }

        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Parent { get; set; }
        public PermissionedAccess? Access { get; set; }
        public PermissionedAccess? ActualAccess { get; set; }
        public PermissionedAccess? InheritedAccess { get; set; }
        public List<string>? Permissions { get; set; }
        public List<string>? ActualPermissions { get; set; }
        public List<string>? InheritedPermissions { get; set; }
        public bool Hidden { get; set; }
    }

    /// <summary>Response of the test host's /api/cache-diagnostics/instance endpoint.</summary>
    public sealed class InstanceInfo
    {
        public string? InstanceId { get; set; }
        public string? MachineName { get; set; }
        public int ProcessId { get; set; }
        public DateTime StartedUtc { get; set; }
        public int UptimeSeconds { get; set; }
        public string? BuildSha { get; set; }
        public bool RedisConfigured { get; set; }

        /// <summary>Whether the in-process L1 cache is active on this instance.</summary>
        public bool L1Enabled { get; set; }

        /// <summary>L1 entry lifetime; the backstop if a pub/sub invalidation is ever missed.</summary>
        public int L1ExpirationSeconds { get; set; }

        /// <summary>Whether this instance is subscribed to the invalidation channel.</summary>
        public bool InvalidationBusConnected { get; set; }

        /// <summary>
        /// Identity used to prove two base URLs are not the same process. Containers all report
        /// PID 1, so the host name has to be part of it.
        /// </summary>
        public string ProcessIdentity => $"{MachineName}:{ProcessId}";
    }

    /// <summary>Response of the test host's /api/cache-diagnostics/cache-stats endpoint.</summary>
    public sealed class CacheStatsResult
    {
        public bool Available { get; set; }
        public List<CacheStatsEntry> Caches { get; set; } = new();

        public CacheStatsEntry? For(string cacheName) =>
            Caches.FirstOrDefault(c => c.CacheName == cacheName);
    }

    public sealed class CacheStatsEntry
    {
        public string? CacheName { get; set; }
        public long Hits { get; set; }
        public long Misses { get; set; }
        public long Invalidations { get; set; }
        public long OverflowPurges { get; set; }
        public int Entries { get; set; }
        public double HitRate { get; set; }

        public long Reads => Hits + Misses;

        public override string ToString() =>
            $"{CacheName}: hits={Hits} misses={Misses} invalidations={Invalidations} entries={Entries}";
    }

    /// <summary>Response of the test host's /api/cache-diagnostics/peek endpoint.</summary>
    public sealed class PeekResult
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
