using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// Thin HTTP wrapper that unwraps the ABP result envelope and turns a failed envelope into a
    /// readable exception. All cluster access goes through this.
    /// </summary>
    public sealed class ShaHttpClient : IDisposable
    {
        public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.Never,
            Converters = { new JsonStringEnumConverter() },
        };

        private readonly HttpClient _http;
        private readonly HttpClientHandler _handler;

        public string BaseUrl { get; }

        public ShaHttpClient(string baseUrl, string? accessToken = null, TimeSpan? timeout = null)
        {
            BaseUrl = baseUrl.TrimEnd('/');

            // The rig serves plain HTTP, but a developer may point the suite at an https host.
            _handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (_, _, _, _) => true,
            };

            _http = new HttpClient(_handler)
            {
                BaseAddress = new Uri(BaseUrl + "/"),
                Timeout = timeout ?? TimeSpan.FromSeconds(30),
            };

            if (!string.IsNullOrWhiteSpace(accessToken))
            {
                _http.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            }
        }

        public async Task<T> GetAsync<T>(string path, IDictionary<string, string?>? query = null)
        {
            using var response = await _http.GetAsync(BuildPath(path, query));
            return await ReadEnvelopeAsync<T>(response, $"GET {path}");
        }

        /// <summary>Returns the raw JSON payload, so unmodelled fields survive a round-trip.</summary>
        public async Task<JsonObject> GetRawAsync(string path, IDictionary<string, string?>? query = null)
        {
            using var response = await _http.GetAsync(BuildPath(path, query));
            var envelope = await ReadRawEnvelopeAsync(response, $"GET {path}");
            return envelope as JsonObject
                   ?? throw new InvalidOperationException($"GET {path} did not return a JSON object.");
        }

        public async Task<T> PostAsync<T>(string path, object? body, IDictionary<string, string?>? query = null)
        {
            using var content = SerializeBody(body);
            using var response = await _http.PostAsync(BuildPath(path, query), content);
            return await ReadEnvelopeAsync<T>(response, $"POST {path}");
        }

        public async Task PostAsync(string path, object? body, IDictionary<string, string?>? query = null)
            => await PostAsync<object?>(path, body, query);

        public async Task<T> PutAsync<T>(string path, object? body)
        {
            using var content = SerializeBody(body);
            using var response = await _http.PutAsync(path.TrimStart('/'), content);
            return await ReadEnvelopeAsync<T>(response, $"PUT {path}");
        }

        /// <summary>
        /// Raw status probe that never throws. Used by the readiness check, where a connection
        /// refusal and a 500 are both simply "not ready".
        /// </summary>
        public async Task<int?> TryGetStatusAsync(string path)
        {
            try
            {
                using var response = await _http.GetAsync(path.TrimStart('/'));
                return (int)response.StatusCode;
            }
            catch
            {
                return null;
            }
        }

        private static StringContent SerializeBody(object? body)
        {
            var json = body is null ? "null" : JsonSerializer.Serialize(body, Json);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }

        private string BuildPath(string path, IDictionary<string, string?>? query)
        {
            var trimmed = path.TrimStart('/');
            if (query is null || query.Count == 0)
                return trimmed;

            var pairs = query
                .Where(kvp => kvp.Value is not null)
                .Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value!)}");

            return $"{trimmed}?{string.Join("&", pairs)}";
        }

        private static async Task<T> ReadEnvelopeAsync<T>(HttpResponseMessage response, string what)
        {
            var payload = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(payload))
            {
                if (!response.IsSuccessStatusCode)
                    throw new ShaApiException($"{what} failed: HTTP {(int)response.StatusCode} with empty body.");
                return default!;
            }

            // Endpoints on plain controllers (the diagnostics one) may return an unwrapped object,
            // so detect the envelope rather than assuming it.
            var node = JsonNode.Parse(payload);
            if (node is JsonObject obj && obj.ContainsKey("success") && obj.ContainsKey("result"))
            {
                var envelope = node.Deserialize<AbpResponse<T>>(Json)!;
                if (!envelope.Success)
                    throw new ShaApiException($"{what} failed: {envelope.Error}");
                return envelope.Result!;
            }

            if (!response.IsSuccessStatusCode)
                throw new ShaApiException($"{what} failed: HTTP {(int)response.StatusCode} — {Truncate(payload)}");

            return node.Deserialize<T>(Json)!;
        }

        private static async Task<JsonNode?> ReadRawEnvelopeAsync(HttpResponseMessage response, string what)
        {
            var payload = await response.Content.ReadAsStringAsync();
            var node = JsonNode.Parse(payload);

            if (node is JsonObject obj && obj.ContainsKey("success"))
            {
                if (obj["success"]?.GetValue<bool>() != true)
                    throw new ShaApiException($"{what} failed: {obj["error"]?.ToJsonString()}");
                return obj["result"];
            }

            if (!response.IsSuccessStatusCode)
                throw new ShaApiException($"{what} failed: HTTP {(int)response.StatusCode} — {Truncate(payload)}");

            return node;
        }

        private static string Truncate(string value) =>
            value.Length <= 400 ? value : value[..400] + "...";

        public void Dispose()
        {
            _http.Dispose();
            _handler.Dispose();
        }
    }

    public sealed class ShaApiException : Exception
    {
        public ShaApiException(string message) : base(message) { }
    }
}
