using Microsoft.Extensions.Configuration;
using Shesha.Configuration;
using System;

namespace Shesha.NHibernate.Configuration
{
    /// <summary>
    /// Used to configure ABP NHibernate module.
    /// </summary>
    public interface IShaNHibernateModuleConfiguration
    {
        /// <summary>
        /// Used to get and modify NHibernate configuration.
        /// You can add mappings to this object.
        /// Do not call BuildSessionFactory on it.
        /// </summary>
        global::NHibernate.Cfg.Configuration NhConfiguration { get; }

        /// <summary>
        /// Current Database type
        /// </summary>
        DbmsType DatabaseType { get; }

        /// <summary>
        /// Current connection string
        /// </summary>
        string ConnectionString { get; }

        /// <summary>
        /// Set MS Sql as a DBMS type
        /// </summary>
        /// <param name="connectionString">Connection string</param>
        void UseMsSql(string connectionString);

        /// <summary>
        /// Set MS Sql as a DBMS type
        /// </summary>
        /// <param name="connectionStringGetter">Connection string factory</param>
        void UseMsSql(Func<IConfigurationRoot, string> connectionStringGetter);
        
        /// <summary>
        /// Use MS Sql with default connection string
        /// </summary>
        void UseMsSql();

        /// <summary>
        /// Set PostgreSql as a DBMS type
        /// </summary>
        /// <param name="connectionString">Connection string</param>
        void UsePostgreSql(string connectionString);

        /// <summary>
        /// Set PostgreSql as a DBMS type
        /// </summary>
        /// <param name="connectionStringGetter">Connection string factory</param>
        void UsePostgreSql(Func<IConfigurationRoot, string> connectionStringGetter);

        /// <summary>
        /// Use PostgreSql with default connection string
        /// </summary>
        void UsePostgreSql();

        /// <summary>
        /// Set DBMS type and connection string
        /// </summary>
        /// <param name="dbmsTypeGetter">DBMS Type factory</param>
        /// <param name="connectionStringGetter">Connection string factory</param>
        void UseDbms(Func<IConfigurationRoot, DbmsType> dbmsTypeGetter, Func<IConfigurationRoot, string> connectionStringGetter);
    }
}