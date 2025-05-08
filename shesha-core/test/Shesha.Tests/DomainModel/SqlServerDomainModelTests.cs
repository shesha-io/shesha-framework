using Shesha.Tests.Fixtures;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    [Collection(SqlServerCollection.Name)]
    public class SqlServerDomainModelTests : DomainModelTestsBase
    {
        public SqlServerDomainModelTests(SqlServerFixture fixture) : base(fixture)
        {
        }
    }
}