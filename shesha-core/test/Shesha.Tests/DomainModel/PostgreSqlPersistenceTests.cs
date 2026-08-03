using Shesha.Testing.Fixtures;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    [Collection(PostgreSqlCollection.Name)]
    public class PostgreSqlPersistenceTests : PersistenceTestsBase
    {
        public PostgreSqlPersistenceTests(PostgreSqlFixture fixture) : base(fixture)
        {
        }
    }
}