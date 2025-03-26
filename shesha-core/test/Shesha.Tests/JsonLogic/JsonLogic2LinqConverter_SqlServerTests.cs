using Shesha.Enterprise.Tests.Fixtures;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    public class JsonLogic2LinqConverter_SqlServerTests : JsonLogic2LinqConverter_DbTestBase, IClassFixture<SqlServerFixture>
    {
        public JsonLogic2LinqConverter_SqlServerTests(SqlServerFixture fixture) : base(fixture)
        {
        }
    }
}
