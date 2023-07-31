using Microsoft.Extensions.Configuration;
using NHibernate;
using NHibernate.Dialect;
using NHibernate.Driver;
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
        /// Custom dialect
        /// </summary>
        Type CustomDialect { get; }

        /// <summary>
        /// Custom driver
        /// </summary>
        Type CustomDriver { get; }

        /// <summary>
        /// Session factory builder
        /// </summary>
        Func<global::NHibernate.Cfg.Configuration, ISessionFactory> SessionFactoryBuilder { get; }

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

        /// <summary>
        /// Use custom dialect
        /// </summary>
        void UseDialect<TDialect>() where TDialect : Dialect;

        /// <summary>
        /// Use custom driver
        /// </summary>
        void UseDriver<TDriver>() where TDriver : IDriver;

        /// <summary>
        /// Use custoim session factory builder
        /// </summary>
        /// <param name="factoryBuilder"></param>
        void UseCustomSessionFactoryBuilder(Func<global::NHibernate.Cfg.Configuration, ISessionFactory> factoryBuilder);
    }
}