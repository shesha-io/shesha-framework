using System.Diagnostics;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// Fans requests across every instance in the test cluster.
    ///
    /// Authenticates ONCE against the first instance and reuses that token everywhere. That is
    /// deliberate on two counts: it mirrors how a load-balanced client behaves, and it makes every
    /// test an implicit assertion that the JWT signing key is identical across instances. If the
    /// keys ever drift, tests fail here with an auth error rather than surfacing later as phantom
    /// "cache incoherence".
    /// </summary>
    public sealed class ClusterClient : IDisposable
    {
        public IReadOnlyList<ClusterInstance> Instances { get; }

        public string AccessToken { get; }

        private ClusterClient(IReadOnlyList<ClusterInstance> instances, string accessToken)
        {
            Instances = instances;
            AccessToken = accessToken;
        }

        public static async Task<ClusterClient> ConnectAsync(CacheTestConfig config)
        {
            if (config.BaseUrls.Length == 0)
                throw new InvalidOperationException("No cluster base URLs configured.");

            using var authClient = new ShaHttpClient(config.BaseUrls[0]);
            var auth = await authClient.PostAsync<AuthenticateResult>(
                "api/TokenAuth/Authenticate",
                new { userNameOrEmailAddress = config.Username, password = config.Password });

            var instances = new List<ClusterInstance>();
            for (var i = 0; i < config.BaseUrls.Length; i++)
            {
                var baseUrl = config.BaseUrls[i];
                var client = new ShaHttpClient(baseUrl, auth.AccessToken);
                var info = await client.GetAsync<InstanceInfo>("api/cache-diagnostics/instance");
                instances.Add(new ClusterInstance(i + 1, baseUrl, info, client));
            }

            return new ClusterClient(instances, auth.AccessToken);
        }

        /// <summary>1-based, matching the api-N container names.</summary>
        public ClusterInstance At(int index)
        {
            if (index < 1 || index > Instances.Count)
                throw new ArgumentOutOfRangeException(
                    nameof(index), $"No instance at index {index} (cluster size {Instances.Count}).");

            return Instances[index - 1];
        }

        /// <summary>Every instance except the given one -- those that did not perform the write.</summary>
        public IEnumerable<ClusterInstance> Others(int index) =>
            Instances.Where(x => x.Index != index);

        /// <summary>Runs a read against every instance concurrently.</summary>
        public async Task<T[]> ReadAllAsync<T>(Func<ClusterInstance, Task<T>> read) =>
            await Task.WhenAll(Instances.Select(read));

        /// <summary>
        /// Polls every instance until all of them return a value matching <paramref name="predicate"/>,
        /// or the timeout expires. Each instance stops being polled once it converges, so the
        /// per-instance timings reflect first agreement rather than last observation.
        /// </summary>
        public async Task<ConvergenceResult<T>> PollUntilConvergedAsync<T>(
            Func<ClusterInstance, Task<T>> read,
            Func<T, bool> predicate,
            TimeSpan? timeout = null,
            TimeSpan? interval = null)
        {
            var limit = timeout ?? TimeSpan.FromSeconds(15);
            var wait = interval ?? TimeSpan.FromMilliseconds(50);

            var perInstanceMs = new long?[Instances.Count];
            var lastSeen = new T?[Instances.Count];
            var attempts = 0;
            var stopwatch = Stopwatch.StartNew();

            while (stopwatch.Elapsed < limit)
            {
                attempts++;

                await Task.WhenAll(Instances.Select(async (instance, i) =>
                {
                    if (perInstanceMs[i].HasValue)
                        return; // already converged

                    try
                    {
                        var value = await read(instance);
                        lastSeen[i] = value;
                        if (predicate(value))
                            perInstanceMs[i] = stopwatch.ElapsedMilliseconds;
                    }
                    catch
                    {
                        // Transient errors mid-propagation are expected; keep polling and let the
                        // timeout decide. A permanent failure shows up as never converging.
                    }
                }));

                if (perInstanceMs.All(v => v.HasValue))
                    break;

                await Task.Delay(wait);
            }

            stopwatch.Stop();

            return new ConvergenceResult<T>
            {
                Converged = perInstanceMs.All(v => v.HasValue),
                ElapsedMs = stopwatch.ElapsedMilliseconds,
                PerInstanceMs = perInstanceMs,
                LastSeen = lastSeen,
                Attempts = attempts,
            };
        }

        /// <summary>Zeroes L1 counters on every instance before a measurement.</summary>
        public Task ResetAllCacheStatsAsync() =>
            Task.WhenAll(Instances.Select(i => i.ResetCacheStatsAsync()));

        /// <summary>
        /// Verifies the configured URLs really are separate processes. Without this the whole
        /// suite could pass while silently testing one instance three times.
        /// </summary>
        public void AssertDistinctInstances()
        {
            var ids = Instances.Select(x => x.Info.InstanceId).ToArray();
            if (ids.Distinct().Count() != ids.Length)
            {
                throw new InvalidOperationException(
                    $"Instances are not distinct: [{string.Join(", ", ids)}]. " +
                    "Check the INSTANCE_ID env vars and that each base URL maps to a different container.");
            }

            var identities = Instances.Select(x => x.Info.ProcessIdentity).ToArray();
            if (identities.Distinct().Count() != identities.Length)
            {
                throw new InvalidOperationException(
                    $"Instances share a process: [{string.Join(", ", identities)}].");
            }
        }

        public void Dispose()
        {
            foreach (var instance in Instances)
                instance.Dispose();
        }
    }
}
