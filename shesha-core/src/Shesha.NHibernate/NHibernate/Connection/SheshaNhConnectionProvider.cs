using Abp.Dependency;
using NHibernate.Connection;
using System;
using System.Data.Common;

namespace Shesha.NHibernate.Connection
{
    public class SheshaNhConnectionProvider: DriverConnectionProvider
    {
        private readonly IIocManager _iocManager;
        private readonly IDbConnectionFactory _connectionFactory;
        public SheshaNhConnectionProvider(IIocManager iocManager)
        {
            _iocManager = iocManager;
            _connectionFactory = iocManager.IsRegistered<IDbConnectionFactory>()
                ? iocManager.Resolve<IDbConnectionFactory>() 
                : null;
        }
        public SheshaNhConnectionProvider(): this(IocManager.Instance) 
        {
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
