using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// Shared Sql Server fixture.
    /// Note: This class has no code, just marks the collection
    /// </summary>
    [CollectionDefinition(Name)]
    public class SqlServerCollection : ICollectionFixture<SqlServerFixture>
    {
        public const string Name = "SharedSqlServer";
    }
}
