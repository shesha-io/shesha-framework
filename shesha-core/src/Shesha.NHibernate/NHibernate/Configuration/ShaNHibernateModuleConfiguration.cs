using Abp.Configuration.Startup;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shesha.Configuration;
using Shesha.Exceptions;
using System;

namespace Shesha.NHibernate.Configuration
{
    internal class ShaNHibernateModuleConfiguration : IShaNHibernateModuleConfiguration
    {
        private readonly IWebHostEnvironment _env;
        private readonly IAbpStartupConfiguration _startupConfig;

        public ShaNHibernateModuleConfiguration(IWebHostEnvironment env, IAbpStartupConfiguration startupConfig)
        {
            _env = env;
            _startupConfig = startupConfig;
            NhConfiguration = new global::NHibernate.Cfg.Configuration();
        }

        /// inheritedDoc
        public global::NHibernate.Cfg.Configuration NhConfiguration { get; }

        private DbmsType _databaseType = DbmsType.NotSpecified;
        private string _connectionString;        

        /// inheritedDoc
        public DbmsType DatabaseType => _databaseType;

        /// inheritedDoc
        public string ConnectionString => _connectionString;

        private void SetConnectionOptions(DbmsType dbmsType, string connectionString) 
        {
            if (_databaseType != DbmsType.NotSpecified)
                throw new DbmsTypeAlreadySpecified();

            _databaseType = dbmsType;
            _connectionString = connectionString;

            _startupConfig.DefaultNameOrConnectionString = connectionString;
        }

        public void UseDbms(Func<IConfigurationRoot, DbmsType> dbmsTypeGetter, Func<IConfigurationRoot, string> connectionStringGetter) 
        {
            var configuration = AppConfigurations.Get(_env.ContentRootPath, _env.EnvironmentName, _env.IsDevelopment());
            
            var dbmsType = dbmsTypeGetter.Invoke(configuration);
            var connectionString = connectionStringGetter.Invoke(configuration);

            SetConnectionOptions(dbmsType, connectionString);
        }

        #region MS SQL

        /// inheritedDoc
        public void UseMsSql(string connectionString)
        {
            SetConnectionOptions(DbmsType.SQLServer, connectionString);
        }

        /// inheritedDoc
        public void UseMsSql(Func<IConfigurationRoot, string> connectionStringGetter)
        {
            var connectionString = GetConnectionStringFromEnvironment(connectionStringGetter);
            UseMsSql(connectionString);
        }

        /// inheritedDoc
        public void UseMsSql()
        {
            UseMsSql(c => c.GetConnectionString(SheshaConsts.ConnectionStringName));
        }

        #endregion

        #region PostgreSql

        /// inheritedDoc
        public void UsePostgreSql(string connectionString)
        {
            SetConnectionOptions(DbmsType.PostgreSQL, connectionString);
        }

        /// inheritedDoc
        public void UsePostgreSql(Func<IConfigurationRoot, string> connectionStringGetter = null)
        {
            var connectionString = GetConnectionStringFromEnvironment(connectionStringGetter);
            UsePostgreSql(connectionString);
        }

        /// inheritedDoc
        public void UsePostgreSql()
        {
            UsePostgreSql(c => c.GetConnectionString(SheshaConsts.ConnectionStringName));
        }

        #endregion

        private string GetConnectionStringFromEnvironment(Func<IConfigurationRoot, string> connectionStringGetter)
        {
            var configuration = AppConfigurations.Get(_env.ContentRootPath, _env.EnvironmentName, _env.IsDevelopment());
            return connectionStringGetter(configuration);
        }
    }
}