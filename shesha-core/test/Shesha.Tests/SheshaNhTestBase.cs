using Shesha.Testing;
using Shesha.Testing.Fixtures;

namespace Shesha.Tests
{
    /// <summary>
    /// Convenience base class for Shesha framework integration tests.
    /// Binds to <see cref="SheshaTestModule"/> so tests don't have to specify the type parameter.
    /// </summary>
    public abstract class SheshaNhTestBase : SheshaNhTestBase<SheshaTestModule>
    {
        protected SheshaNhTestBase(IDatabaseFixture fixture) : base(fixture)
        {
        }
    }
}
