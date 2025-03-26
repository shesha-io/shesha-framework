namespace Shesha.Enterprise.Tests.Fixtures
{
    public interface IDatabaseFixture
    {
        bool IsDbAvailable { get; }
        string ConnectionString { get; }
        DbmsType DbmsType { get; }
    }
}
