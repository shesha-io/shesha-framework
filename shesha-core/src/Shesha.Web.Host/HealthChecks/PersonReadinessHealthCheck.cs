using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using NHibernate.Linq;
using Shesha.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Web.Host.HealthChecks
{
    /// <summary>
    /// Readiness probe: confirms the DB connection the rest of the app uses is reachable via a
    /// cheap query against <see cref="Person"/>. Not the path Azure auto-recycles on - see
    /// /api/health/live. Registered as a singleton so one probe is shared process-wide.
    /// </summary>
    public class PersonReadinessHealthCheck : IHealthCheck
    {
        private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(3);

        private readonly IIocResolver _iocResolver;
        private readonly ILogger<PersonReadinessHealthCheck> _logger;

        private readonly object _probeLock = new object();
        private Task? _inFlightProbe;

        public PersonReadinessHealthCheck(IIocResolver iocResolver, ILogger<PersonReadinessHealthCheck> logger)
        {
            _iocResolver = iocResolver;
            _logger = logger;
        }

        /// <summary>
        /// Reports Healthy/Unhealthy, bounding the response to <see cref="ProbeTimeout"/> even
        /// though the probe itself cannot be cancelled once it is opening a connection.
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var probeTask = StartOrJoinProbe();

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            var timeoutTask = Task.Delay(ProbeTimeout, timeoutCts.Token);

            var completedTask = await Task.WhenAny(probeTask, timeoutTask);
            timeoutCts.Cancel();

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
                // Logged once by the continuation in StartOrJoinProbe.
                return HealthCheckResult.Unhealthy("Database unreachable");
            }
        }

        /// <summary>
        /// Returns the probe already running, or starts one. A probe that outlives its caller's
        /// timeout cannot be cancelled, so starting one per request would pile up a blocked thread,
        /// session and connection attempt for as long as the database stays unreachable.
        /// </summary>
        private Task StartOrJoinProbe()
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
                var probe = Task.Run(ProbeDatabaseAsync);

                // Observed here, not at the call site: an abandoned probe may have no caller left
                // to await it, and joiners must not each log the same failure.
                _ = probe.ContinueWith(
                    t => _logger.LogWarning(t.Exception, "Readiness probe failed: database not reachable."),
                    TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously);

                _inFlightProbe = probe;
                return probe;
            }
        }

        // No CancellationToken: the probe is shared, so one caller dropping its request must not
        // kill another caller's probe - and the connection open it blocks in ignores tokens anyway.
        private async Task ProbeDatabaseAsync()
        {
            using var unitOfWorkManager = _iocResolver.ResolveAsDisposable<IUnitOfWorkManager>();
            using var personRepository = _iocResolver.ResolveAsDisposable<IRepository<Person, Guid>>();
            using var uow = unitOfWorkManager.Object.Begin();

            await personRepository.Object.GetAll().AnyAsync();
            await uow.CompleteAsync();
        }
    }
}
