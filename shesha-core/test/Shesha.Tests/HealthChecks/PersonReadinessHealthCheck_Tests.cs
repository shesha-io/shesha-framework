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
    /// Covers the failure path with plain mocks - no DB needed since the repository is made to
    /// throw directly, simulating a DB that's unreachable.
    /// </summary>
    [Trait("RunOnPipeline", "yes")]
    public class PersonReadinessHealthCheck_UnhealthyPath_Tests
    {
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
    }
}
