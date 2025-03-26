namespace Shesha.Enterprise.Tests.Fixtures
{
    public class NoDBFixture : IDatabaseFixture
    {
        public string ConnectionString => string.Empty;

        public DbmsType DbmsType => DbmsType.NotSpecified;

        public bool IsDbAvailable => false;
    }
}
