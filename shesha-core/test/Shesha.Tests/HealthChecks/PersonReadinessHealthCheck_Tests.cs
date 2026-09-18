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
                Resolve<ILogger<PersonReadinessHealthCheck>>());

            var result = await sut.CheckHealthAsync(new HealthCheckContext());

            result.Status.ShouldBe(HealthStatus.Healthy);
        }
    }

    /// <summary>
    /// Covers the failure paths with plain mocks - no DB needed, since the repository is made to
    /// throw or the unit of work to block, simulating a DB that's unreachable.
    /// </summary>
    [Trait("RunOnPipeline", "yes")]
    public class PersonReadinessHealthCheck_UnhealthyPath_Tests
    {
        // Begin() blocks synchronously, the way opening a connection to a server that accepts the
        // TCP connection but never answers does.
        private static Mock<IIocResolver> BlockingIocResolver(ManualResetEventSlim release)
        {
            var unitOfWorkManager = new Mock<IUnitOfWorkManager>();
            unitOfWorkManager.Setup(m => m.Begin()).Returns(() =>
            {
                release.Wait(TimeSpan.FromSeconds(30));
                return Mock.Of<IUnitOfWorkCompleteHandle>();
            });

            return IocResolverFor(unitOfWorkManager.Object, Mock.Of<IRepository<Person, Guid>>());
        }

        private static Mock<IIocResolver> IocResolverFor(IUnitOfWorkManager unitOfWorkManager, IRepository<Person, Guid> personRepository)
        {
            var iocResolver = new Mock<IIocResolver>();
            iocResolver.Setup(r => r.Resolve<IUnitOfWorkManager>()).Returns(unitOfWorkManager);
            iocResolver.Setup(r => r.Resolve<IRepository<Person, Guid>>()).Returns(personRepository);
            return iocResolver;
        }

        private static PersonReadinessHealthCheck CreateSut(IIocResolver iocResolver)
        {
            return new PersonReadinessHealthCheck(iocResolver, Mock.Of<ILogger<PersonReadinessHealthCheck>>());
        }

        [Fact]
        public async Task CheckHealthAsync_WhenRepositoryThrows_ReturnsUnhealthyWithoutLeakingException()
        {
            var sensitiveMessage = "Server=secret-db;Password=hunter2;";
            var personRepository = new Mock<IRepository<Person, Guid>>();
            personRepository.Setup(r => r.GetAll()).Throws(new InvalidOperationException(sensitiveMessage));

            var unitOfWorkManager = new Mock<IUnitOfWorkManager>();
            unitOfWorkManager.Setup(m => m.Begin()).Returns(Mock.Of<IUnitOfWorkCompleteHandle>());

            var sut = CreateSut(IocResolverFor(unitOfWorkManager.Object, personRepository.Object).Object);

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
            var sut = CreateSut(BlockingIocResolver(release).Object);

            var stopwatch = Stopwatch.StartNew();
            var result = await sut.CheckHealthAsync(new HealthCheckContext());
            stopwatch.Stop();

            result.Status.ShouldBe(HealthStatus.Unhealthy);
            result.Description!.ShouldBe("Database unreachable");
            // The probe is still blocked; answering anyway is the point. Without the offload in
            // StartOrJoinProbe this waits out the full 30s block rather than the 3s ProbeTimeout.
            stopwatch.Elapsed.ShouldBeLessThan(TimeSpan.FromSeconds(15));

            release.Set();
        }

        [Fact]
        public async Task CheckHealthAsync_WhenProbeAlreadyRunning_JoinsItInsteadOfStartingAnother()
        {
            using var release = new ManualResetEventSlim(false);
            var iocResolver = BlockingIocResolver(release);
            var sut = CreateSut(iocResolver.Object);

            var first = sut.CheckHealthAsync(new HealthCheckContext());
            var second = sut.CheckHealthAsync(new HealthCheckContext());
            var results = await Task.WhenAll(first, second);

            results[0].Status.ShouldBe(HealthStatus.Unhealthy);
            results[1].Status.ShouldBe(HealthStatus.Unhealthy);
            // One probe served both requests. Starting one per request is what would pile up
            // blocked threads, sessions and connection attempts during an outage.
            iocResolver.Verify(r => r.Resolve<IUnitOfWorkManager>(), Times.Once);

            release.Set();
        }

        [Fact]
        public async Task CheckHealthAsync_WhenCallerCancels_PropagatesCancellationInsteadOfReportingDbOutage()
        {
            using var release = new ManualResetEventSlim(false);
            var sut = CreateSut(BlockingIocResolver(release).Object);

            using var callerCts = new CancellationTokenSource();
            callerCts.CancelAfter(TimeSpan.FromMilliseconds(200));

            await Should.ThrowAsync<OperationCanceledException>(
                async () => { await sut.CheckHealthAsync(new HealthCheckContext(), callerCts.Token); });

            release.Set();
        }
    }
}
