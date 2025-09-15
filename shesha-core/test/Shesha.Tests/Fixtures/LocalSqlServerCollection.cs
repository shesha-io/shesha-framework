using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// Local Shared Sql Server fixture.
    /// Note: This class has no code, just marks the collection
    /// </summary>
    [CollectionDefinition(Name)]
    public class LocalSqlServerCollection : ICollectionFixture<LocalSqlServerFixture>
    {
        public const string Name = "LocalSqlServer";
    }
}
