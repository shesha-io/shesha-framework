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
    /// /api/health/live.
    /// </summary>
    public class PersonReadinessHealthCheck : IHealthCheck
    {
        private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(3);

        // Resolved per check rather than constructor-injected: a repository captured at
        // registration time never gets its Windsor-injected properties set, and NREs when queried.
        private readonly IIocResolver _iocResolver;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ILogger<PersonReadinessHealthCheck> _logger;

        public PersonReadinessHealthCheck(IIocResolver iocResolver, IUnitOfWorkManager unitOfWorkManager, ILogger<PersonReadinessHealthCheck> logger)
        {
            _iocResolver = iocResolver;
            _unitOfWorkManager = unitOfWorkManager;
            _logger = logger;
        }

        /// <summary>
        /// Reports Healthy/Unhealthy, bounding the response to <see cref="ProbeTimeout"/> even
        /// though the probe itself cannot be cancelled once it is opening a connection.
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

            // Task.Run is load-bearing: the probe blocks before it yields, so without offloading
            // it runs to completion here and Task.Delay never gets to race it. Measured against an
            // unresponsive server, the response then takes the connection string's Connection
            // Timeout (35s) rather than ProbeTimeout.
            var probeTask = Task.Run(() => ProbeDatabaseAsync(timeoutCts.Token), timeoutCts.Token);
            var timeoutTask = Task.Delay(ProbeTimeout, timeoutCts.Token);

            var completedTask = await Task.WhenAny(probeTask, timeoutTask);
            timeoutCts.Cancel();

            if (completedTask == timeoutTask)
            {
                // Our timeout elapsing is a DB signal; the caller's token being cancelled is a
                // dropped request, and must not be reported as a DB outage.
                cancellationToken.ThrowIfCancellationRequested();

                _logger.LogWarning("Readiness health check timed out after {ProbeTimeout}.", ProbeTimeout);
                ObserveAbandonedProbe(probeTask);
                return HealthCheckResult.Unhealthy("Database unreachable");
            }

            try
            {
                await probeTask;
                return HealthCheckResult.Healthy();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Readiness health check failed: database not reachable.");
                return HealthCheckResult.Unhealthy("Database unreachable");
            }
        }

        private async Task ProbeDatabaseAsync(CancellationToken cancellationToken)
        {
            using var uow = _unitOfWorkManager.Begin();
            var personRepository = _iocResolver.Resolve<IRepository<Person, Guid>>();
            await personRepository.GetAll().AnyAsync(cancellationToken);
            await uow.CompleteAsync();
        }

        // The Unhealthy response was already sent by the time an abandoned probe settles, so log
        // its fault rather than leaving it unobserved.
        private void ObserveAbandonedProbe(Task probeTask)
        {
            _ = probeTask.ContinueWith(
                t => _logger.LogWarning(t.Exception, "Abandoned readiness probe failed after the response was already sent."),
                TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously);
        }
    }
}
