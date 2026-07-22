using Shesha.Testing.Fixtures;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// xUnit collection definition for Testcontainers-based PostgreSQL fixture.
    /// Must be in the same assembly as the tests that use it.
    /// </summary>
    [CollectionDefinition(Name)]
    public class PostgreSqlCollection : ICollectionFixture<PostgreSqlFixture>
    {
        public const string Name = "SharedPostgreSql";
    }
}
