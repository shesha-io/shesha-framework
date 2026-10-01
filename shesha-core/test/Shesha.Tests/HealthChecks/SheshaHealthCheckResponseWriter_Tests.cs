using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Shesha.HealthChecks;
using Shouldly;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.HealthChecks
{
    [Trait("RunOnPipeline", "yes")]
    public class SheshaHealthCheckResponseWriter_Tests
    {
        private static async Task<string> WriteAndReadBodyAsync(HealthReport report)
        {
            var context = new DefaultHttpContext();
            using var body = new MemoryStream();
            context.Response.Body = body;

            await SheshaHealthCheckResponseWriter.WriteResponseAsync(context, report);

            body.Seek(0, SeekOrigin.Begin);
            return Encoding.UTF8.GetString(body.ToArray());
        }

        [Fact]
        public async Task WriteResponse_WhenNoEntries_WritesMinimalHealthyPayload()
        {
            var report = new HealthReport(new Dictionary<string, HealthReportEntry>(), TimeSpan.Zero);

            var json = await WriteAndReadBodyAsync(report);

            json.ShouldBe("{\"status\":\"Healthy\"}");
        }

        [Fact]
        public async Task WriteResponse_WhenCheckFails_DoesNotLeakExceptionDetails()
        {
            var sensitiveException = new InvalidOperationException("Server=secret-db;Password=hunter2;");
            var entries = new Dictionary<string, HealthReportEntry>
            {
                ["person-db"] = new HealthReportEntry(
                    HealthStatus.Unhealthy,
                    "Database unreachable",
                    TimeSpan.Zero,
                    sensitiveException,
                    data: null,
                    tags: new[] { "ready" })
            };
            var report = new HealthReport(entries, TimeSpan.Zero);

            var json = await WriteAndReadBodyAsync(report);

            json.ShouldContain("\"status\":\"Unhealthy\"");
            json.ShouldContain("\"description\":\"Database unreachable\"");
            json.ShouldNotContain("secret-db");
            json.ShouldNotContain("hunter2");
            json.ShouldNotContain(nameof(InvalidOperationException));
        }
    }
}
