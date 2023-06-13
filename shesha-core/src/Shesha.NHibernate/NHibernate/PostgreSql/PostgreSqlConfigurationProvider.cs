using NHibernate.Dialect;
using NhConfiguration = global::NHibernate.Cfg.Configuration;
namespace Shesha.NHibernate.PostgreSql
{
    /// <summary>
    /// PostgreSQL configuration provider
    /// </summary>
    public class PostgreSqlConfigurationProvider : IDbmsSpecificConfigurationProvider
    {
        public NhConfiguration Configure(NhConfiguration nhConfig, string connectionString)
        {
            return nhConfig.DataBaseIntegration(db =>
             {
                 db.ConnectionString = connectionString;

                 db.Dialect<PostgreSQL83Dialect>();
                 db.Driver<CitextPostgreSqlDriver>();

                 db.Timeout = 150;
                 db.LogFormattedSql = true;
             })
                .SetNamingStrategy(QuotedNamingStrategy.Instance);
        }
    }
}
