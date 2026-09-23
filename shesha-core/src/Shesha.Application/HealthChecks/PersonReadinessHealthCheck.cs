using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.HealthChecks
{
    /// <summary>
    /// Readiness check: reports whether <see cref="IPersonReadinessProbe"/> can reach the DB the
    /// rest of the app uses. Not the path Azure auto-recycles on - see /api/health/live.
    /// Registered as a singleton so one probe is shared process-wide.
    /// </summary>
    public class PersonReadinessHealthCheck : IHealthCheck
    {
        private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(3);

        private readonly IPersonReadinessProbe _probe;
        private readonly ILogger<PersonReadinessHealthCheck> _logger;

        private readonly object _probeLock = new object();
        private Task? _inFlightProbe;

        public PersonReadinessHealthCheck(IPersonReadinessProbe probe, ILogger<PersonReadinessHealthCheck> logger)
        {
            _probe = probe;
            _logger = logger;
        }

        /// <summary>
        /// Reports Healthy/Unhealthy, bounding the response to <see cref="ProbeTimeout"/> even
        /// though the probe itself cannot be cancelled once it is opening a connection.
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var probeTask = StartOrJoinProbeAsync();

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            var timeoutTask = Task.Delay(ProbeTimeout, timeoutCts.Token);

            var completedTask = await Task.WhenAny(probeTask, timeoutTask);
            await timeoutCts.CancelAsync();

            if (completedTask == timeoutTask)
            {
                // Our timeout elapsing is a DB signal; the caller's token being cancelled is a
                // dropped request, and must not be reported as a DB outage.
                cancellationToken.ThrowIfCancellationRequested();

                _logger.LogWarning("Readiness health check timed out after {ProbeTimeout}.", ProbeTimeout);
                return HealthCheckResult.Unhealthy("Database unreachable");
            }

            try
            {
                await probeTask;
                return HealthCheckResult.Healthy();
            }
            catch (Exception)
            {
                // Logged once by the continuation in StartOrJoinProbeAsync.
                return HealthCheckResult.Unhealthy("Database unreachable");
            }
        }

        /// <summary>
        /// Returns the probe already running, or starts one. A probe that outlives its caller's
        /// timeout cannot be cancelled, so starting one per request would pile up a blocked thread,
        /// session and connection attempt for as long as the database stays unreachable.
        /// </summary>
        private Task StartOrJoinProbeAsync()
        {
            lock (_probeLock)
            {
                var inFlight = _inFlightProbe;
                if (inFlight != null && !inFlight.IsCompleted)
                    return inFlight;

                // Task.Run is load-bearing: the probe blocks before it yields, so without
                // offloading it runs to completion here and Task.Delay never gets to race it.
                // Measured against an unresponsive server, the response then takes the connection
                // string's Connection Timeout (35s) rather than ProbeTimeout.
                var probe = Task.Run(_probe.ProbeAsync);

                // Observed here, not at the call site: an abandoned probe may have no caller left
                // to await it, and joiners must not each log the same failure.
                _ = probe.ContinueWith(
                    t => _logger.LogWarning(t.Exception, "Readiness probe failed: database not reachable."),
                    CancellationToken.None,
                    TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously,
                    TaskScheduler.Default);

                _inFlightProbe = probe;
                return probe;
            }
        }
    }
}
