using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Shesha.HealthChecks
{
    public static class SheshaHealthCheckExtensions
    {
        private const string ReadyTag = "ready";

        public static IServiceCollection AddSheshaHealthChecks(this IServiceCollection services)
        {
            // Singleton so the readiness probe is shared: only one runs at a time, however many
            // requests arrive while the database is unreachable.
            services.AddSingleton<PersonReadinessHealthCheck>();
            services.AddHealthChecks()
                .AddCheck<PersonReadinessHealthCheck>("person-db", tags: new[] { ReadyTag });

            return services;
        }

        public static IEndpointRouteBuilder MapSheshaHealthChecks(this IEndpointRouteBuilder endpoints)
        {
            // Liveness: no dependency checks, this is the path Azure App Service Health Check
            // should ping. Readiness: probes the DB via Person, for internal monitoring only -
            // see docs/health-checks.md for why Azure's auto-recycle must not use /ready.
            endpoints.MapHealthChecks("/api/health/live", new HealthCheckOptions
            {
                Predicate = _ => false,
                ResponseWriter = SheshaHealthCheckResponseWriter.WriteResponseAsync
            });
            endpoints.MapHealthChecks("/api/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains(ReadyTag),
                ResponseWriter = SheshaHealthCheckResponseWriter.WriteResponseAsync
            });

            return endpoints;
        }
    }
}
