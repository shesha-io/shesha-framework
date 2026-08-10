namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// Database fixture providing connection configuration for integration tests.
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
