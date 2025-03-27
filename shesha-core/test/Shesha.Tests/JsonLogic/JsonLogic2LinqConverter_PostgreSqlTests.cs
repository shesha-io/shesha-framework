using Shesha.Enterprise.Tests.Fixtures;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    public class JsonLogic2LinqConverter_PostgreSqlTests : JsonLogic2LinqConverter_DbTestBase, IClassFixture<PostgreSqlFixture>
    {
        public JsonLogic2LinqConverter_PostgreSqlTests(PostgreSqlFixture fixture) : base(fixture)
        {
        }
    }
}
