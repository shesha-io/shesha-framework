using System.Text.Json.Nodes;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// One API instance in the cluster, with the operations the coherence tests need.
    ///
    /// Instances are addressed directly by index, never through the load balancer: a coherence
    /// assertion is meaningless unless the test controls which instance answered.
    /// </summary>
    public sealed class ClusterInstance : IDisposable
    {
        private readonly ShaHttpClient _client;

        /// <summary>1-based, matching the api-N container names.</summary>
        public int Index { get; }

        public string BaseUrl { get; }

        public InstanceInfo Info { get; }

        public ClusterInstance(int index, string baseUrl, InstanceInfo info, ShaHttpClient client)
        {
            Index = index;
            BaseUrl = baseUrl;
            Info = info;
            _client = client;
        }

        public override string ToString() => $"api-{Index} ({Info.InstanceId})";

        // --- settings ---------------------------------------------------------------------

        /// <summary>
        /// Reads a setting value. GetValue is [AllowAnonymous] on the server, but the request
        /// still passes through SheshaAuthorizationFilter, so it exercises the permissioned-object
        /// cache on the hot path either way.
        /// </summary>
        public Task<T> GetSettingAsync<T>(CacheTestConfig.SettingIdentifier setting) =>
            _client.GetAsync<T>("api/services/app/Settings/GetValue", new Dictionary<string, string?>
            {
                ["Module"] = setting.Module,
                ["Name"] = setting.Name,
            });

        /// <summary>Writes a setting value. Requires the pages:maintenance permission.</summary>
        public Task UpdateSettingAsync(CacheTestConfig.SettingIdentifier setting, object? value) =>
            _client.PostAsync("api/services/app/Settings/UpdateValue", new
            {
                module = setting.Module,
                name = setting.Name,
                value,
            });

        // --- permissioned objects ---------------------------------------------------------

        public Task<PermissionedObjectDto> GetApiPermissionsAsync(CacheTestConfig.ApiTarget target) =>
            GetApiPermissionsAsync(target.ServiceName, target.ActionName);

        public Task<PermissionedObjectDto> GetApiPermissionsAsync(string serviceName, string actionName) =>
            _client.GetAsync<PermissionedObjectDto>(
                "api/services/app/PermissionedObject/GetApiPermissions",
                new Dictionary<string, string?> { ["serviceName"] = serviceName, ["actionName"] = actionName });

        private Task<JsonObject> GetApiPermissionsRawAsync(CacheTestConfig.ApiTarget target) =>
            _client.GetRawAsync(
                "api/services/app/PermissionedObject/GetApiPermissions",
                new Dictionary<string, string?>
                {
                    ["serviceName"] = target.ServiceName,
                    ["actionName"] = target.ActionName,
                });

        /// <summary>
        /// Sets access level and permission list by reading the current DTO, mutating those two
        /// fields on the RAW JSON, and PUTting it back.
        ///
        /// PUT /Update is the only usable write path. The obvious-looking SetApiPermissions
        /// endpoint takes serviceName/actionName from the query and the bare access enum as its
        /// body, and its `permissions` list is absent from the generated contract entirely --
        /// ASP.NET inferred two body parameters from the method signature. In practice it rejects
        /// every request with "A non-empty request body is required".
        ///
        /// Mutating raw JSON rather than a typed DTO means fields this suite does not model
        /// (category, module, md5, additionalParameters, ...) round-trip verbatim instead of being
        /// reset to null.
        /// </summary>
        public async Task<PermissionedObjectDto> SetAccessAsync(
            CacheTestConfig.ApiTarget target,
            PermissionedAccess access,
            IEnumerable<string>? permissions = null)
        {
            var dto = await GetApiPermissionsRawAsync(target);

            dto["access"] = (int)access;
            dto["permissions"] = new JsonArray((permissions ?? Array.Empty<string>())
                .Select(p => (JsonNode)JsonValue.Create(p)!)
                .ToArray());

            return await _client.PutAsync<PermissionedObjectDto>(
                "api/services/app/PermissionedObject/Update", dto);
        }

        /// <summary>Restores a permissioned object from a previously captured raw snapshot.</summary>
        public Task<PermissionedObjectDto> RestoreAsync(JsonObject snapshot) =>
            _client.PutAsync<PermissionedObjectDto>(
                "api/services/app/PermissionedObject/Update", snapshot);

        public Task<JsonObject> SnapshotApiPermissionsAsync(CacheTestConfig.ApiTarget target) =>
            GetApiPermissionsRawAsync(target);

        // --- diagnostics ------------------------------------------------------------------

        /// <summary>Inspects one cache entry as it exists in Redis right now.</summary>
        public Task<PeekResult> PeekAsync(string cacheName, string key) =>
            _client.GetAsync<PeekResult>("api/cache-diagnostics/peek", new Dictionary<string, string?>
            {
                ["cacheName"] = cacheName,
                ["key"] = key,
            });

        public void Dispose() => _client.Dispose();
    }
}
