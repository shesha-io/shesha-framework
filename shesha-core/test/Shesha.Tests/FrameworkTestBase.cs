using Shesha.Enterprise.Tests.Fixtures;

namespace Shesha.Tests
{
    public abstract class FrameworkTestBase : CleanSheshaNhTestBase<SheshaTestModule>
    {
        protected FrameworkTestBase(IDatabaseFixture fixture) : base(fixture)
        {
        }
    }
}
