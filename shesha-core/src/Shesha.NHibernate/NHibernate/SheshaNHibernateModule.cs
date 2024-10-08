using Abp;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Authorization.Users;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.MultiTenancy;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Abp.Threading;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NHibernate;
using NHibernate.Dialect;
using NHibernate.Driver;
using NHibernate.Engine;
using NHibernate.Spatial.Dialect;
using NHibernate.Spatial.Mapping;
using NHibernate.Spatial.Metadata;
using Npgsql;
using Shesha.Attributes;
using Shesha.Bootstrappers;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.FluentMigrator;
using Shesha.Locks;
using Shesha.NHibernate.Configuration;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Interceptors;
using Shesha.NHibernate.Linq;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.MsSql;
using Shesha.NHibernate.PostgreSql;
using Shesha.NHibernate.Repositories;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.Uow;
using Shesha.NHibernate.Utilites;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Startup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using NhEnvironment = global::NHibernate.Cfg.Environment;

namespace Shesha.NHibernate
{
    [DependsOn(
        typeof(AbpKernelModule), 
        typeof(AbpAspNetCoreModule),
        typeof(SheshaFrameworkModule)
        )]
    public class SheshaNHibernateModule : AbpModule
    {
        public const string SkipMigrationsSetting = "skipMigrations";
        public const string SkipBootstrappersSetting = "skipBootstrappers";

        /* Used it tests to skip dbcontext registration */
        public bool SkipDbContextRegistration { get; set; }
        public bool SkipDbSeed { get; set; }
        public string ConnectionString { get; set; }

        private readonly IAssemblyFinder _assembleFinder;
        private readonly ITypeFinder _typeFinder;
        /// <summary>
        /// NHibernate session factory object.
        /// </summary>
        private ISessionFactory _sessionFactory;
        private global::NHibernate.Cfg.Configuration _nhConfig;

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

                var configProvider = GetConfigProvider(config.DatabaseType);

                _nhConfig = configProvider.Configure(Configuration.Modules.ShaNHibernate().NhConfiguration, config.ConnectionString)
                    .SetProperty("hbm2ddl.keywords", "auto-quote")
                    .CurrentSessionContext<UnitOfWorkSessionContext>();

                if (config.CustomDriver != null)
                    _nhConfig.Properties[NhEnvironment.ConnectionDriver] = config.CustomDriver.AssemblyQualifiedName;

                if (config.CustomDialect != null)
                    _nhConfig.Properties[NhEnvironment.Dialect] = config.CustomDialect.AssemblyQualifiedName;

                // register linq extensions
                _nhConfig.LinqToHqlGeneratorsRegistry<SheshaLinqToHqlGeneratorsRegistry>();

                // register filters
                _nhConfig.AddFilterDefinition(SoftDeleteFilter.GetDefinition());
                _nhConfig.AddFilterDefinition(MayHaveTenantFilter.GetDefinition());
                _nhConfig.AddFilterDefinition(MustHaveTenantFilter.GetDefinition());

                var conventions = new Conventions();
                var mappingAssemblies = new Dictionary<Assembly, string>
                {
                    { typeof(UserToken).Assembly, "Abp" },
                    { typeof(UserLogin).Assembly, "Abp" }
                };
                foreach (var item in mappingAssemblies)
                {
                    conventions.AddAssembly(item.Key, item.Value);
                }

                var assembliesWithEntities = _assembleFinder.GetAllAssemblies()
                    .Distinct(new AssemblyFullNameComparer())
                    .Where(a => !a.IsDynamic &&
                                a.GetTypes().Any(t => MappingHelper.IsEntity(t))
                    )
                    .ToList();
                foreach (var assembly in assembliesWithEntities)
                {
                    if (!conventions.AssemblyAdded(assembly))
                        conventions.AddAssembly(assembly, assembly.GetCustomAttribute<TablePrefixAttribute>()?.Prefix);
                }

                conventions.Compile(_nhConfig);

                if (IocManager.IsRegistered<IInterceptor>())
                    _nhConfig.SetInterceptor(IocManager.Resolve<IInterceptor>());

                _nhConfig.SessionFactory().GenerateStatistics();

                // ToDo: ABP662, some ABP entities (WebhookEvent, DynamicProperty) contain not virtual properties
                _nhConfig.Properties.Add("use_proxy_validator", "false");

                _sessionFactory = config.SessionFactoryBuilder != null
                    ? config.SessionFactoryBuilder.Invoke(_nhConfig)
                    : _nhConfig.BuildSessionFactory();

                IocManager.IocContainer.Install(new NhRepositoryInstaller(_sessionFactory));
            }

            IocManager.IocContainer.Install(new SheshaNHibernateInstaller());

            IocManager.IocContainer.Register(
                Component.For<IConnectionStringResolver, IDbPerTenantConnectionStringResolver, IDbConnectionSettingsResolver>()
                    .ImplementedBy<DbPerTenantConnectionStringResolver>()
                    .LifestyleTransient(),
                Component.For<IAbpZeroDbMigrator>().ImplementedBy<SheshaDbMigrator>().LifestyleTransient()
            );

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
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
            _typeFinder = typeFinder;
        }

        /// inheritedDoc
        public override void PostInitialize()
        {
            if (!SkipDbSeed)
            {
                var prev = Configuration.EntityHistory.IsEnabledForAnonymousUsers;
                Configuration.EntityHistory.IsEnabledForAnonymousUsers = false;
                AsyncHelper.RunSync(async () => {
                    await SeedDatabaseAsync();
                });
                Configuration.EntityHistory.IsEnabledForAnonymousUsers = prev;
            }
        }

        /// <summary>
        /// Seed database (applies migrations, runs bootstrappers/seeders)
        /// </summary>
        private async Task SeedDatabaseAsync()
        {
            var ioc = StaticContext.IocManager;

            var configuration = ioc.Resolve<IConfiguration>();

            var skipMigration = configuration.GetValue<bool>(SkipMigrationsSetting);
            var skipBootstrappers = configuration.GetValue<bool>(SkipBootstrappersSetting);

            if (skipMigration && skipBootstrappers) 
            {
                Logger.Warn($"Database initialization skipped due to configuration (`{SkipMigrationsSetting}` is {skipMigration}, `{SkipBootstrappersSetting}` is {skipBootstrappers})");
                return;
            }

            var lockFactory = ioc.Resolve<ILockFactory>();
            var cacheManager = ioc.Resolve<ICacheManager>();

            // Note: the application may work in the multiple instance environment (e.g. on Azure)
            // We are trying to acquire a lock and initialize the application, possible cases:
            // 1. lock successfully acquired - initialize the application
            // 2. initialization is locked by another process - wait for completion and check the result of initialization. If the initialization failed - we can't continue the process and just throw exception

            Logger.Warn("Try to initialize database...");

            var expiry = TimeSpan.FromSeconds(30);
            var wait = TimeSpan.FromSeconds(10);
            var retry = TimeSpan.FromSeconds(1);
            
            const string seedDbKey = "AppStart:SeedDb";
            const string seedDbFinishedOnKey = "SeedDbFinishedOn";
            var cache = CacheManagerExtensions.GetCache<string, DateTime>(cacheManager, seedDbKey);

            var initializationStart = DateTime.Now.ToUniversalTime();
            var initializedByCurrentInstance = false;
            await lockFactory.DoExclusiveAsync(seedDbKey, expiry, wait, retry, async () =>
            {
                // get last initialization time
                var seedDbTime = await cache.GetAsync(seedDbFinishedOnKey, key => Task.FromResult(DateTime.MinValue));

                if (seedDbTime != DateTime.MinValue && (
                        seedDbTime.Ticks > initializationStart.Ticks || /* DB was initialized while we were waiting for the lock */
                        (initializationStart - seedDbTime).TotalSeconds <= 30 /* DB was initialized less than 30 seconds ago */
                    ))
                {
                    Logger.Warn("Database initialized by another application instance");
                    return;
                }

                var appStartup = ioc.Resolve<IApplicationStartupSession>();

                initializedByCurrentInstance = true;
                Logger.Warn("Database initialization started");

                // Check DB structure and log application start if possible
                var dbIsReadyForLogging = await appStartup.DbIsReadyForLoggingAsync();
                var appStartLogArgs = new LogApplicationStartArgs { MigrationsDisabled = skipMigration, BootstrappersDisabled = skipBootstrappers };
                var startupDto = dbIsReadyForLogging
                    ? await appStartup.LogApplicationStartAsync(appStartLogArgs)
                    : null;

                try
                {
                    if (!skipMigration)
                    {
                        Logger.Warn("Apply migrations...");
                        var dbMigrator = ioc.Resolve<IAbpZeroDbMigrator>();
                        dbMigrator?.CreateOrMigrateForHost();
                        Logger.Warn("Apply migrations - finished");
                    }
                    else {
                        if (!dbIsReadyForLogging)
                            throw new Exception("DB structure doesn't allow ther application to start. Make sure that database migration are switched on");

                        Logger.Warn($"Migrations skipped due to configuration (`{SkipMigrationsSetting}` is {skipMigration})");
                    }                    

                    // Log application start if DB was not ready for logging before the migrations
                    if (!dbIsReadyForLogging)
                        startupDto = await appStartup.LogApplicationStartAsync(appStartLogArgs);

                    if (!skipBootstrappers) 
                    {
                        if (!appStartup.AllAssembliesStayUnchanged) 
                        {
                            // find all seeders/bootstrappers and run them
                            var bootstrapperTypes = _typeFinder.Find(t => typeof(IBootstrapper).IsAssignableFrom(t) && t.IsClass).ToList();
                            bootstrapperTypes = SortByDependencies(bootstrapperTypes);

                            foreach (var bootstrapperType in bootstrapperTypes)
                            {
                                if (ioc.IsRegistered(bootstrapperType) && ioc.Resolve(bootstrapperType) is IBootstrapper bootstrapper)
                                {
                                    Logger.Warn($"Run bootstrapper: {bootstrapperType.Name}...");

                                    var method = bootstrapperType.GetMethod(nameof(IBootstrapper.ProcessAsync));
                                    var unitOfWorkAttribute = method.GetAttribute<UnitOfWorkAttribute>(true);
                                    var useDefaultUnitOfWork = unitOfWorkAttribute == null || !unitOfWorkAttribute.IsDisabled;

                                    if (useDefaultUnitOfWork)
                                    {
                                        var uowManager = ioc.Resolve<IUnitOfWorkManager>();
                                        using (var unitOfWork = uowManager.Begin())
                                        {
                                            await bootstrapper.ProcessAsync();
                                            await unitOfWork.CompleteAsync();
                                        }
                                    }
                                    else
                                        await bootstrapper.ProcessAsync();

                                    Logger.Warn($"Run bootstrapper: {bootstrapperType.Name} - finished");
                                }
                            }
                        } else
                            Logger.Warn($"Bootstrappers skipped. Previous startup was full, successful and all assemblies stay unchanged");
                    }
                    else
                        Logger.Warn($"Bootstrappers skipped due to configuration (`{SkipBootstrappersSetting}` is {skipBootstrappers})");

                    await appStartup.StartupSuccessAsync(startupDto.Id);
                }
                catch(Exception e)
                {
                    if (startupDto != null) {
                        await appStartup.StartupFailedAsync(startupDto.Id, e);
                    }                        
                    throw;
                }

                // update the DB seeding time
                await cache.SetAsync(seedDbFinishedOnKey, initializationStart, TimeSpan.FromMinutes(10));
            });

            Logger.Warn(initializedByCurrentInstance 
                ? "Database initialization finished" : 
                "Database initialization skipped (locked by another instance)");
        }

        private List<Type> SortByDependencies(List<Type> types)
        {
            var withDeps = types.Select(t => new
                {
                    Type = t,
                    Dependencies = t.GetAttribute<DependsOnBootstrapperAttribute>()?.DependedBootstrappers?.ToList()
                })
                .ToList();
            
            var result = new List<Type>();

            while (withDeps.Count > 0)
            {
                var i = 0;
                var emptyLoop = true;
                while (i <= withDeps.Count - 1)
                {
                    var current = withDeps[i];
                    if (current.Dependencies == null || current.Dependencies.All(t => result.Contains(t)))
                    {
                        result.Add(current.Type);
                        withDeps.RemoveAt(i);
                        emptyLoop = false;
                    }
                    else
                        i++;
                }

                if (emptyLoop)
                    break;
            }

            return result;
        }

        /// <inheritdoc/>
        public override void Shutdown()
        {
            _sessionFactory?.Dispose();
        }
    }
}