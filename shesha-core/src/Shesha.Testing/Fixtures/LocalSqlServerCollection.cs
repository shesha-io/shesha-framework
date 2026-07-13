using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// Shared local SQL Server fixture collection.
    /// </summary>
    [CollectionDefinition(Name)]
    public class LocalSqlServerCollection : ICollectionFixture<LocalSqlServerFixture>
    {
        public const string Name = "LocalSqlServer";
    }
}
