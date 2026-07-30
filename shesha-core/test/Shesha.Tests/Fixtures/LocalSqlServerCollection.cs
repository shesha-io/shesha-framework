using Shesha.Testing.Fixtures;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// xUnit collection definition for local SQL Server fixture (no Docker).
    /// Must be in the same assembly as the tests that use it.
    /// </summary>
    [CollectionDefinition(Name)]
    public class LocalSqlServerCollection : ICollectionFixture<LocalSqlServerFixture>
    {
        public const string Name = "LocalSqlServer";
    }
}
