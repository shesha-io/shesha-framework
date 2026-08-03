using Shesha.Testing.Fixtures;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// xUnit collection definition for Testcontainers-based SQL Server fixture.
    /// Must be in the same assembly as the tests that use it.
    /// </summary>
    [CollectionDefinition(Name)]
    public class SqlServerCollection : ICollectionFixture<SqlServerFixture>
    {
        public const string Name = "SharedSqlServer";
    }
}
