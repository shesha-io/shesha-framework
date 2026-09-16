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

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(ProbeTimeout);

            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var personRepository = _iocResolver.Resolve<IRepository<Person, Guid>>();
                    await personRepository.GetAll().AnyAsync(timeoutCts.Token);
                    await uow.CompleteAsync();
                }
                return HealthCheckResult.Healthy();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Readiness health check failed: database not reachable.");
                return HealthCheckResult.Unhealthy("Database unreachable");
            }
        }
    }
}
