using Abp.Dependency;
using Npgsql;
using Shesha.NHibernate.Connection;
using System.Data.Common;

namespace Shesha.NHibernate.PostGis
{
    /// <summary>
    /// PostGis connection factory
    /// </summary>
    public class ConnectionFactory : IDbConnectionFactory, ISingletonDependency
    {
        protected Dictionary<string, NpgsqlDataSource> DataSources = new Dictionary<string, NpgsqlDataSource>();

        public DbConnection CreateConnection(string connectionString)
        {
            var dataSource = DataSources.TryGetValue(connectionString, out var ds)
                ? ds
                : null;
            if (dataSource == null) 
            {
                var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);

                // Use NTS plugin for mapping PostGIS types; see:
                // https://www.npgsql.org/doc/release-notes/4.0.html#improved-spatial-support-postgis
                dataSourceBuilder.UseNetTopologySuite();

                dataSource = dataSourceBuilder.Build();

                DataSources[connectionString] = dataSource;
            }

            return dataSource.CreateConnection();
        }
    }
}
