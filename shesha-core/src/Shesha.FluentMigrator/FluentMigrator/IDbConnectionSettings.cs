namespace Shesha.FluentMigrator
{
    /// <summary>
    /// DB connection settings
    /// </summary>
    public interface IDbConnectionSettings
    {
        /// <summary>
        /// DBMS type
        /// </summary>
        DbmsType DbmsType { get; }

        /// <summary>
        /// Connection string
        /// </summary>
        string ConnectionString { get; }
    }
}
