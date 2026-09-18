using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Moq;
using Shesha.Domain;
using Shesha.Testing.Fixtures;
using Shesha.Web.Host.HealthChecks;
using Shouldly;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.HealthChecks
{
    /// <summary>
    /// Covers <see cref="PersonReadinessHealthCheck"/> against a real NHibernate session, since
    /// its query relies on NHibernate.Linq's async provider and can't be exercised against an
    /// in-memory IQueryable (NHibernate.Linq requires an INhQueryProvider).
    /// </summary>
    [Trait("RunOnPipeline", "yes")]
    [Collection(SqlServerCollection.Name)]
    public class PersonReadinessHealthCheck_HealthyPath_Tests : SheshaNhTestBase
    {
        public PersonReadinessHealthCheck_HealthyPath_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task CheckHealthAsync_WhenDbReachable_ReturnsHealthy()
        {
            var sut = new PersonReadinessHealthCheck(
                Resolve<IIocResolver>(),
                Resolve<IUnitOfWorkManager>(),
                Resolve<ILogger<PersonReadinessHealthCheck>>());

            var result = await sut.CheckHealthAsync(new HealthCheckContext());

            result.Status.ShouldBe(HealthStatus.Healthy);
        }
    }

    /// <summary>
    /// Covers the failure paths with plain mocks - no DB needed, since the repository is made to
    /// throw or to block, simulating a DB that's unreachable.
    /// </summary>
    [Trait("RunOnPipeline", "yes")]
    public class PersonReadinessHealthCheck_UnhealthyPath_Tests
    {
        // Blocks synchronously, the way NHibernate does while opening a connection to a server
        // that accepts the TCP connection but never answers.
        private static Mock<IUnitOfWorkManager> BlockingUnitOfWorkManager(ManualResetEventSlim release)
        {
            var unitOfWorkManager = new Mock<IUnitOfWorkManager>();
            unitOfWorkManager.Setup(m => m.Begin()).Returns(() =>
            {
                release.Wait(TimeSpan.FromSeconds(30));
                return Mock.Of<IUnitOfWorkCompleteHandle>();
            });
            return unitOfWorkManager;
        }

        private static PersonReadinessHealthCheck CreateSut(IUnitOfWorkManager unitOfWorkManager)
        {
            return new PersonReadinessHealthCheck(
                Mock.Of<IIocResolver>(),
                unitOfWorkManager,
                Mock.Of<ILogger<PersonReadinessHealthCheck>>());
        }

        [Fact]
        public async Task CheckHealthAsync_WhenRepositoryThrows_ReturnsUnhealthyWithoutLeakingException()
        {
            var sensitiveMessage = "Server=secret-db;Password=hunter2;";
            var personRepository = new Mock<IRepository<Person, Guid>>();
            personRepository.Setup(r => r.GetAll()).Throws(new InvalidOperationException(sensitiveMessage));

            var iocResolver = new Mock<IIocResolver>();
            iocResolver.Setup(r => r.Resolve<IRepository<Person, Guid>>()).Returns(personRepository.Object);

            var unitOfWork = new Mock<IUnitOfWorkCompleteHandle>();
            unitOfWork.Setup(u => u.CompleteAsync()).Returns(Task.CompletedTask);

            var unitOfWorkManager = new Mock<IUnitOfWorkManager>();
            unitOfWorkManager.Setup(m => m.Begin()).Returns(unitOfWork.Object);

            var sut = new PersonReadinessHealthCheck(
                iocResolver.Object,
                unitOfWorkManager.Object,
                new Mock<ILogger<PersonReadinessHealthCheck>>().Object);

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
            var sut = CreateSut(BlockingUnitOfWorkManager(release).Object);

            var stopwatch = Stopwatch.StartNew();
            var result = await sut.CheckHealthAsync(new HealthCheckContext());
            stopwatch.Stop();

            result.Status.ShouldBe(HealthStatus.Unhealthy);
            result.Description!.ShouldBe("Database unreachable");
            // The probe is still blocked; answering anyway is the point. Without the offload in
            // CheckHealthAsync this waits out the full 30s block rather than the 3s ProbeTimeout.
            stopwatch.Elapsed.ShouldBeLessThan(TimeSpan.FromSeconds(15));

            release.Set();
        }

        [Fact]
        public async Task CheckHealthAsync_WhenCallerCancels_PropagatesCancellationInsteadOfReportingDbOutage()
        {
            using var release = new ManualResetEventSlim(false);
            var sut = CreateSut(BlockingUnitOfWorkManager(release).Object);

            using var callerCts = new CancellationTokenSource();
            callerCts.CancelAfter(TimeSpan.FromMilliseconds(200));

            await Should.ThrowAsync<OperationCanceledException>(
                async () => { await sut.CheckHealthAsync(new HealthCheckContext(), callerCts.Token); });

            release.Set();
        }
    }
}
