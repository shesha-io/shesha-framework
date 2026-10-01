using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Moq;
using Shesha.HealthChecks;
using Shouldly;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.HealthChecks
{
    [Trait("RunOnPipeline", "yes")]
    public class PersonReadinessHealthCheck_Tests
    {
        // ProbeAsync blocks synchronously, the way opening a connection to a server that accepts the
        // TCP connection but never answers does.
        private static Mock<IPersonReadinessProbe> BlockingProbe(ManualResetEventSlim release)
        {
            var probe = new Mock<IPersonReadinessProbe>();
            probe.Setup(p => p.ProbeAsync()).Returns(() =>
            {
                release.Wait(TimeSpan.FromSeconds(30));
                return Task.CompletedTask;
            });
            return probe;
        }

        private static PersonReadinessHealthCheck CreateSut(IPersonReadinessProbe probe)
        {
            return new PersonReadinessHealthCheck(probe, Mock.Of<ILogger<PersonReadinessHealthCheck>>());
        }

        [Fact]
        public async Task CheckHealthAsync_WhenProbeSucceeds_ReturnsHealthy()
        {
            var probe = new Mock<IPersonReadinessProbe>();
            probe.Setup(p => p.ProbeAsync()).Returns(Task.CompletedTask);
            var sut = CreateSut(probe.Object);

            var result = await sut.CheckHealthAsync(new HealthCheckContext());

            result.Status.ShouldBe(HealthStatus.Healthy);
        }

        [Fact]
        public async Task CheckHealthAsync_WhenProbeThrows_ReturnsUnhealthyWithoutLeakingException()
        {
            var sensitiveMessage = "Server=secret-db;Password=hunter2;";
            var probe = new Mock<IPersonReadinessProbe>();
            probe.Setup(p => p.ProbeAsync()).ThrowsAsync(new InvalidOperationException(sensitiveMessage));
            var sut = CreateSut(probe.Object);

            var result = await sut.CheckHealthAsync(new HealthCheckContext());

            result.Status.ShouldBe(HealthStatus.Unhealthy);
            result.Description.ShouldNotBeNull();
            result.Description!.ShouldBe("Database unreachable");
            result.Description!.ShouldNotContain(sensitiveMessage);
        }

        [Fact]
        public async Task CheckHealthAsync_WhenProbeOutlivesTimeout_ReturnsUnhealthyWithoutWaitingForIt()
        {
            using var release = new ManualResetEventSlim(false);
            var sut = CreateSut(BlockingProbe(release).Object);

            var stopwatch = Stopwatch.StartNew();
            var result = await sut.CheckHealthAsync(new HealthCheckContext());
            stopwatch.Stop();

            result.Status.ShouldBe(HealthStatus.Unhealthy);
            result.Description!.ShouldBe("Database unreachable");
            // The probe is still blocked; answering anyway is the point. Without the offload in
            // StartOrJoinProbeAsync this waits out the full 30s block rather than the 3s ProbeTimeout.
            stopwatch.Elapsed.ShouldBeLessThan(TimeSpan.FromSeconds(15));

            release.Set();
        }

        [Fact]
        public async Task CheckHealthAsync_WhenProbeAlreadyRunning_JoinsItInsteadOfStartingAnother()
        {
            using var release = new ManualResetEventSlim(false);
            var probe = BlockingProbe(release);
            var sut = CreateSut(probe.Object);

            var first = sut.CheckHealthAsync(new HealthCheckContext());
            var second = sut.CheckHealthAsync(new HealthCheckContext());
            var results = await Task.WhenAll(first, second);

            results[0].Status.ShouldBe(HealthStatus.Unhealthy);
            results[1].Status.ShouldBe(HealthStatus.Unhealthy);
            // One probe served both requests. Starting one per request is what would pile up
            // blocked threads, sessions and connection attempts during an outage.
            probe.Verify(p => p.ProbeAsync(), Times.Once);

            release.Set();
        }

        [Fact]
        public async Task CheckHealthAsync_WhenCallerCancels_PropagatesCancellationInsteadOfReportingDbOutage()
        {
            using var release = new ManualResetEventSlim(false);
            var sut = CreateSut(BlockingProbe(release).Object);

            using var callerCts = new CancellationTokenSource();
            callerCts.CancelAfter(TimeSpan.FromMilliseconds(200));

            await Should.ThrowAsync<OperationCanceledException>(
                async () => { await sut.CheckHealthAsync(new HealthCheckContext(), callerCts.Token); });

            release.Set();
        }
    }
}
