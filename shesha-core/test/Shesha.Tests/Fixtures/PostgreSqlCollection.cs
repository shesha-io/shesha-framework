using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// Shared PostgreSql fixture.
    /// Note: This class has no code, just marks the collection
    /// </summary>
    [CollectionDefinition(Name)]
    public class PostgreSqlCollection : ICollectionFixture<PostgreSqlFixture>
    {
        public const string Name = "SharedPostgreSql";
    }
}
