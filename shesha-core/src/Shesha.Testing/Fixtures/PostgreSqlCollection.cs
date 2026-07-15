using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// Shared PostgreSql fixture (Testcontainers).
    /// </summary>
    [CollectionDefinition(Name)]
    public class PostgreSqlCollection : ICollectionFixture<PostgreSqlFixture>
    {
        public const string Name = "SharedPostgreSql";
    }
}
