using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// Shared Sql Server fixture (Testcontainers).
    /// </summary>
    [CollectionDefinition(Name)]
    public class SqlServerCollection : ICollectionFixture<SqlServerFixture>
    {
        public const string Name = "SharedSqlServer";
    }
}
