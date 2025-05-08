using NHibernate.Connection;
using Shesha.Services;
using System;
using System.Data.Common;

namespace Shesha.NHibernate.Connection
{
    public class SheshaNhConnectionProvider: DriverConnectionProvider
    {
        private readonly IDbConnectionFactory? _connectionFactory;
        public SheshaNhConnectionProvider()
        {
            _connectionFactory = StaticContext.IocManager.IsRegistered<IDbConnectionFactory>()
                ? StaticContext.IocManager.Resolve<IDbConnectionFactory>() 
                : null;
        }

        public override DbConnection GetConnection(string connectionString)
        {
            if (_connectionFactory == null)
                return base.GetConnection(connectionString);

            var conn = _connectionFactory.CreateConnection(connectionString);
            try
            {
                // Important: don't set connectionstring again, it may break some type mappings
                //conn.ConnectionString = connectionString;
                conn.Open();
            }
            catch (Exception)
            {
                conn.Dispose();
                throw;
            }

            return conn;
        }
    }
}
