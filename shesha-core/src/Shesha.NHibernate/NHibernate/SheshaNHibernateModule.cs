using Abp;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.MultiTenancy;
using Abp.Reflection;
using Abp.Threading;
using Castle.MicroKernel.Registration;
using NHibernate;
using Shesha.Authorization;
using Shesha.Bootstrappers;
using Shesha.Configuration.Startup;
using Shesha.DbActions;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.FluentMigrator;
using Shesha.Generators;
using Shesha.NHibernate.Configuration;
using Shesha.NHibernate.Interceptors;
using Shesha.NHibernate.MsSql;
using Shesha.NHibernate.PostgreSql;
using Shesha.NHibernate.Repositories;
using Shesha.NHibernate.Uow;
using System;
using System.Reflection;

namespace Shesha.NHibernate
{
    [DependsOn(
        typeof(AbpKernelModule), 
        typeof(AbpAspNetCoreModule),
        typeof(AbpAutoMapperModule),
        typeof(SheshaFrameworkModule)
        )]
    public sealed class SheshaNHibernateModule : AbpModule, IDisposable
    {
        private bool _disposed;


        /* Used it tests to skip dbcontext registration */
        public bool SkipDbContextRegistration { get; set; }
        public bool SkipDbSeed { get; set; }
        public string ConnectionString { get; set; }

        private readonly IAssemblyFinder _assembleFinder;
        /// <summary>
        /// NHibernate session factory object.
        /// </summary>
        private ISessionFactory? _sessionFactory;
        //private global::NHibernate.Cfg.Configuration _nhConfig;

        private IDatabaseSeeder? _databaseSeeder;

        public override void PreInitialize()
        {
            IocManager.Register<IShaNHibernateModuleConfiguration, ShaNHibernateModuleConfiguration>();
            Configuration.ReplaceService<IUnitOfWorkFilterExecuter, NhUnitOfWorkFilterExecuter>(DependencyLifeStyle.Transient);
            IocManager.IocContainer.Register(Component.For<IInterceptor>().ImplementedBy<SheshaNHibernateInterceptor>().LifestyleTransient());

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "Shesha",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            var config = Configuration.Modules.ShaNHibernate();

            if (!SkipDbContextRegistration)
            {
                if (config.DatabaseType == DbmsType.NotSpecified) 
                {
                    // backward compatibility
                    config.UseMsSql();

                    // throw new DbmsTypeNotSpecified();
                }

                var _initializer = new ShaNHibernateInitializer(
                    config,
                    _assembleFinder,
                    IocManager.IocContainer.Resolve<INameGenerator>(),
                    IocManager.IsRegistered<IInterceptor>() ? IocManager.Resolve<IInterceptor>() : null,
                    IocManager.IocContainer.Resolve<IShaTypeFinder>()
                );

                IocManager.IocContainer.Install(new NhRepositoryInstaller(_initializer));
            }

            switch (config.DatabaseType)
            {
                case DbmsType.SQLServer:
                    IocManager.IocContainer.Register(Component.For<IDbMetadataActions>().ImplementedBy<DbMsSqlGenerateActions>());
                    break;
                case DbmsType.PostgreSQL:
                    // ToDo: AS - add postgre support
                    //IocManager.IocContainer.Register(Component.For<IDbMetadataActions>().ImplementedBy<DbPostgreMetadataActions>());
                    break;
                default:
                    // backward compatibility
                    IocManager.IocContainer.Register(Component.For<IDbMetadataActions>().ImplementedBy<DbMsSqlGenerateActions>());
                    break;
            }

            IocManager.IocContainer.Install(new SheshaNHibernateInstaller());

            IocManager.IocContainer.Register(
                Component.For<IConnectionStringResolver, IDbPerTenantConnectionStringResolver, IDbConnectionSettingsResolver>()
                    .ImplementedBy<DbPerTenantConnectionStringResolver>()
                    .LifestyleTransient(),
                Component.For<IAbpZeroDbMigrator>().ImplementedBy<SheshaDbMigrator>().LifestyleTransient(),
                Component.For<SheshaAutoDbMigrator>().ImplementedBy<SheshaAutoDbMigrator>().LifestyleTransient()
            );

            // Firs initialization
            _sessionFactory = IocManager.IocContainer.Resolve<ISessionFactory>();

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            if (!SkipDbSeed)
            {
                _databaseSeeder?.Dispose();
                _databaseSeeder = new DatabaseSeeder(Logger, IocManager);
                var prev = Configuration.EntityHistory.IsEnabled;
                Configuration.EntityHistory.IsEnabled = false;
                AsyncHelper.RunSync(() => _databaseSeeder.MigrateDatabaseAsync());
                Configuration.EntityHistory.IsEnabled = prev;
            }
        }

        /// inheritedDoc
        public override void PostInitialize()
        {
            if (_databaseSeeder != null)
            {
                var prev = Configuration.EntityHistory.IsEnabled;
                Configuration.EntityHistory.IsEnabled = false;
                AsyncHelper.RunSync(() => _databaseSeeder.BootstrapDatabaseAsync());
                Configuration.EntityHistory.IsEnabled = prev;
            }

            if (_databaseSeeder == null)
            {
                _databaseSeeder?.Dispose();
                _databaseSeeder = new DatabaseSeeder(Logger, IocManager);
            }
            AsyncHelper.RunSync(() => _databaseSeeder.InitDataFromDatabaseAsync());
        }

        private void FreeSessionFactory() 
        {
            if (_sessionFactory != null)
            {
                _sessionFactory.Dispose();
                _sessionFactory = null;
            }
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            FreeSessionFactory();
            _databaseSeeder?.Dispose();
        }

        private IDbmsSpecificConfigurationProvider GetConfigProvider(DbmsType dbmsType) 
        {
            switch (dbmsType) 
            {
                case DbmsType.SQLServer:
                    return new MsSqlConfigurationProvider();
                case DbmsType.PostgreSQL:
                    return new PostgreSqlConfigurationProvider();
                default:
                    throw new NotSupportedException($"DBMS Type '{dbmsType}' not supported");
            }
        }

        /// inheritedDoc
        public SheshaNHibernateModule(IAssemblyFinder assembleFinder, ITypeFinder typeFinder)
        {
            _assembleFinder = assembleFinder;
        }

        /// <inheritdoc/>
        public override void Shutdown()
        {
            FreeSessionFactory();
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }
    }
}