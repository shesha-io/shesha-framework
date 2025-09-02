using Abp;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using Abp.Modules;
using Abp.MultiTenancy;
using Abp.Reflection;
using Abp.Threading;
using Castle.MicroKernel.Registration;
using NHibernate;
using Shesha.Bootstrappers;
using Shesha.Configuration.Startup;
using Shesha.DbActions;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.FluentMigrator;
using Shesha.Generators;
using Shesha.NHibernate.Configuration;
using Shesha.NHibernate.Interceptors;
using Shesha.NHibernate.Repositories;
using Shesha.NHibernate.Uow;
using Shesha.Reflection;
using Shesha.Warmup;
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

        /// inheritedDoc
        public SheshaNHibernateModule(IAssemblyFinder assembleFinder)
        {
            _assembleFinder = assembleFinder;
        }

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
                    IocManager.IocContainer.Register(Component.For<IDbMetadataActions>().ImplementedBy<DbPostgreMetadataActions>());
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
            var prev = Configuration.EntityHistory.IsEnabled;
            Configuration.EntityHistory.IsEnabled = false;
            AsyncHelper.RunSync(() => _databaseSeeder.NotNull().BootstrapDatabaseAsync());
            Configuration.EntityHistory.IsEnabled = prev;

            AsyncHelper.RunSync(() => _databaseSeeder.NotNull().InitDataFromDatabaseAsync());

            var eventBus = IocManager.Resolve<IEventBus>();
            eventBus.Trigger<DatabaseInitializedEventData>(this, new());
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

        /// <inheritdoc/>
        public override void Shutdown()
        {
            FreeSessionFactory();
        }
    }
}