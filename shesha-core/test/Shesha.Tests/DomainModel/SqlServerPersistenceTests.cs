using Shesha.Testing.Fixtures;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    [Collection(SqlServerCollection.Name)]
    public class SqlServerPersistenceTests : PersistenceTestsBase
    {
        public SqlServerPersistenceTests(SqlServerFixture fixture) : base(fixture)
        {
        }
    }
}