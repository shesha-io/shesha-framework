using Shesha.Tests.Fixtures;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    [Collection(PostgreSqlCollection.Name)]
    public class PostgreSqlDomainModelTests : DomainModelTestsBase
    {
        public PostgreSqlDomainModelTests(PostgreSqlFixture fixture) : base(fixture)
        {
        }
    }
}