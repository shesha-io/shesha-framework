using System.Diagnostics;

namespace Shesha.CacheTests.Infrastructure
{
    /// <summary>
    /// Outcome of polling every instance until they all agree.
    ///
    /// On the current build this should be near request latency, because Redis is the single
    /// source of truth and an invalidation is visible everywhere immediately. Once an L1 cache
    /// exists, <see cref="ElapsedMs"/> IS the staleness window -- which is the number that should
    /// drive the TTL decision rather than one picked by feel.
    /// </summary>
    public sealed class ConvergenceResult<T>
    {
        public required bool Converged { get; init; }

        /// <summary>Time until the last instance reported the expected value.</summary>
        public required long ElapsedMs { get; init; }

        /// <summary>Per-instance time to first report the expected value; null if it never did.</summary>
        public required long?[] PerInstanceMs { get; init; }

        /// <summary>Last value observed per instance, for diagnosing a non-convergence.</summary>
        public required T?[] LastSeen { get; init; }

        public required int Attempts { get; init; }

        public string DescribeTimings() =>
            string.Join(", ", PerInstanceMs.Select((ms, i) =>
                $"api-{i + 1}={(ms.HasValue ? $"{ms}ms" : "never")}"));

        public string DescribeLastSeen() =>
            string.Join(", ", LastSeen.Select((v, i) => $"api-{i + 1}={FormatValue(v)}"));

        private static string FormatValue(T? value) => value?.ToString() ?? "(null)";
    }

    internal static class Stopwatches
    {
        public static long ElapsedMs(this Stopwatch stopwatch) => stopwatch.ElapsedMilliseconds;
    }
}
