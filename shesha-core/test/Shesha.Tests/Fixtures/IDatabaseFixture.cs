namespace Shesha.Tests.Fixtures
{
    /// <summary>
    /// Database fixture
    /// </summary>
    public interface IDatabaseFixture
    {
        /// <summary>
        /// Connection string
        /// </summary>
        string ConnectionString { get; }

        /// <summary>
        /// DBMS type
        /// </summary>
        DbmsType DbmsType { get; }
    }
}
