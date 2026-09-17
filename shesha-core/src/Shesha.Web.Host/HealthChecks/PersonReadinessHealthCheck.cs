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
    /// Readiness probe for Azure App Service Health Check: confirms the DB connection the rest of
    /// the app uses is reachable via a cheap query against <see cref="Person"/>. Not for the
    /// liveness path Azure auto-recycles on - see /api/health/live.
    /// </summary>
    public class PersonReadinessHealthCheck : IHealthCheck
    {
        private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(3);

        // Resolved fresh per check (not constructor-injected): the built-in health checks
        // middleware creates this class outside ABP's Castle Windsor request pipeline, so a
        // repository captured at registration time never gets its Windsor-injected properties
        // (e.g. SpecificationManager) set, and throws NullReferenceException when queried.
        // Resolving through IIocResolver here, inside an explicit unit of work, mirrors how
        // ScheduledJobRunner talks to the DB outside a normal MVC request.
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
        /// Runs the DB probe and reports Healthy/Unhealthy, bounding the wall-clock time to
        /// <see cref="ProbeTimeout"/> even if the probe itself never observes cancellation.
        /// </summary>
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            // Linked (not the raw caller token) so we can cancel it ourselves once either side of
            // the race below finishes - that's what lets an abandoned probe's own CancellationToken
            // checks (if any are reached) unwind, instead of it running free on the caller's token,
            // which may well outlive this method (Azure's own request can stay open well past our
            // ProbeTimeout).
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            var probeTask = ProbeDatabaseAsync(timeoutCts.Token);

            // NHibernate's default connection provider opens the ADO connection via the
            // synchronous SqlConnection.Open(), which takes no CancellationToken - so cancellation
            // can only be observed once a connection already exists, never while establishing one.
            // Racing against Task.Delay is what actually bounds the response time when the DB is
            // unreachable over the network (as opposed to refusing the connection immediately),
            // which is what Azure's health check needs.
            var timeoutTask = Task.Delay(ProbeTimeout, timeoutCts.Token);
            var completedTask = await Task.WhenAny(probeTask, timeoutTask);
            timeoutCts.Cancel();

            if (completedTask == timeoutTask)
            {
                _logger.LogWarning("Readiness health check timed out after {ProbeTimeout}.", ProbeTimeout);
                ObserveAbandonedProbe(probeTask);
                return HealthCheckResult.Unhealthy("Database unreachable");
            }

            try
            {
                await probeTask;
                return HealthCheckResult.Healthy();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Readiness health check failed: database not reachable.");
                return HealthCheckResult.Unhealthy("Database unreachable");
            }
        }

        private async Task ProbeDatabaseAsync(CancellationToken cancellationToken)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var personRepository = _iocResolver.Resolve<IRepository<Person, Guid>>();
                await personRepository.GetAll().AnyAsync(cancellationToken);
                await uow.CompleteAsync();
            }
        }

        // The response was already sent as Unhealthy by the time this probe settles, so there's
        // nothing left to report it to - just log a fault instead of leaving it unobserved.
        private void ObserveAbandonedProbe(Task probeTask)
        {
            _ = probeTask.ContinueWith(
                t => _logger.LogWarning(t.Exception, "Abandoned readiness probe failed after the response was already sent."),
                TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously);
        }
    }
}
