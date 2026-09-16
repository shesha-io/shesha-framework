using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.Web.Host.HealthChecks
{
    /// <summary>
    /// Writes health check results as a small JSON payload, e.g. {"status":"Healthy"}. On failure,
    /// only the sanitized <see cref="HealthReportEntry.Description"/> is surfaced - never the
    /// underlying exception - so connection strings and stack traces are never exposed.
    /// </summary>
    public static class SheshaHealthCheckResponseWriter
    {
        public static Task WriteResponse(HttpContext context, HealthReport report)
        {
            context.Response.ContentType = "application/json";

            object payload = report.Entries.Count == 0
                ? new { status = report.Status.ToString() }
                : new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(entry => new
                    {
                        name = entry.Key,
                        status = entry.Value.Status.ToString(),
                        description = entry.Value.Status == HealthStatus.Healthy ? null : entry.Value.Description
                    }).ToArray()
                };

            return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
