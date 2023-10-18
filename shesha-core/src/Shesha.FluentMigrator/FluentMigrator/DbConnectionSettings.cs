using Abp;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// DB connection settings
    /// </summary>
    public class DbConnectionSettings : IDbConnectionSettings
    {
        public DbmsType DbmsType { get; set; }

        public string ConnectionString { get; set; }

        public DbConnectionSettings(DbmsType dbmsType, string connectionString)
        {
            DbmsType = dbmsType;
            ConnectionString = connectionString;
        }

        private static readonly AsyncLocal<IDbConnectionSettings?> InternalState = new AsyncLocal<IDbConnectionSettings?>();

        public static IDbConnectionSettings? Current { 
            get 
            {
                return InternalState.Value;
            }
        }

        public static IDisposable BeginConnectionScope(IDbConnectionSettings settings)
        {
            InternalState.Value = settings;
            return new DisposeAction(() => 
            {
                InternalState.Value = null;
            });
        }
    }
}
