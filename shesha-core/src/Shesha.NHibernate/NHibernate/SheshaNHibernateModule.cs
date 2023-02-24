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
using Microsoft.Extensions.Configuration;
using NHibernate;
using NHibernate.Dialect;
using NHibernate.Driver;
using Shesha.Attributes;
using Shesha.Bootstrappers;
using Shesha.Configuration.Startup;
using Shesha.Domain;
using Shesha.Locks;
using Shesha.NHibernate.Configuration;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Interceptors;
using Shesha.NHibernate.Linq;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.Repositories;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.Uow;
using Shesha.NHibernate.Utilites;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.NHibernate
{
    [DependsOn(typeof(AbpKernelModule), typeof(AbpAspNetCoreModule))]
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

            if (!SkipDbContextRegistration)
            {
                _nhConfig = Configuration.Modules.ShaNHibernate().NhConfiguration
                    .DataBaseIntegration(db =>
                    {
                        db.ConnectionString = !string.IsNullOrWhiteSpace(ConnectionString)
                            ? ConnectionString
                            : NHibernateUtilities.ConnectionString;
                        
                        db.Dialect<MsSql2012Dialect>();
                        db.Driver<Sql2008ClientDriver>();
                        db.Timeout = 150;
                        /*
                        db.Timeout = string.IsNullOrEmpty(ConfigurationManager.AppSettings["SqlTimeoutInSeconds"])
                            ? (byte)150
                            : (byte)int.Parse(ConfigurationManager.AppSettings["SqlTimeoutInSeconds"]);
                        */

                        db.LogFormattedSql = true;
                    })
                    .SetProperty("hbm2ddl.keywords", "auto-quote")
                    .CurrentSessionContext<UnitOfWorkSessionContext>();

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
            }
        }

        public override void Initialize()
        {
            #region  from Abp

            var cfg = Configuration.Modules.ShaNHibernate().NhConfiguration;
           
            if (IocManager.IsRegistered<IInterceptor>())
                cfg.SetInterceptor(IocManager.Resolve<IInterceptor>());

            cfg.SessionFactory().GenerateStatistics();

            // ToDo: ABP662, some ABP entities (WebhookEvent, DynamicProperty) contain not virtual properties
            cfg.Properties.Add("use_proxy_validator", "false");

            _sessionFactory = cfg.BuildSessionFactory();

            IocManager.IocContainer.Install(new NhRepositoryInstaller(_sessionFactory));

            #endregion

            IocManager.IocContainer.Install(new SheshaNHibernateInstaller());

            IocManager.IocContainer.Register(
                Component.For<IConnectionStringResolver, IDbPerTenantConnectionStringResolver>()
                    .ImplementedBy<DbPerTenantConnectionStringResolver>()
                    .LifestyleTransient(),
                Component.For<IAbpZeroDbMigrator>().ImplementedBy<SheshaDbMigrator>().LifestyleTransient()
            );

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
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
                SeedDatabase();
            }
        }

        /// <summary>
        /// Seed database (applies migrations, runs bootstrappers/seeders)
        /// </summary>
        private void SeedDatabase()
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
            lockFactory.DoExclusive(seedDbKey, expiry, wait, retry, () =>
            {
                // get last initialization time
                var seedDbTime = cache.Get(seedDbFinishedOnKey, key => DateTime.MinValue);

                if (seedDbTime != DateTime.MinValue && (
                        seedDbTime.Ticks > initializationStart.Ticks || /* DB was initialized while we were waiting for the lock */
                        (initializationStart - seedDbTime).TotalSeconds <= 30 /* DB was initialized less than 30 seconds ago */
                    ))
                {
                    Logger.Warn("Database initialized by another application instance");
                    return;
                }

                initializedByCurrentInstance = true;
                Logger.Warn("Database initialization started");

                if (!skipMigration) 
                {
                    Logger.Warn("Apply migrations...");
                    var dbMigrator = ioc.Resolve<IAbpZeroDbMigrator>();
                    dbMigrator?.CreateOrMigrateForHost();
                    Logger.Warn("Apply migrations - finished");
                } 
                else
                    Logger.Warn($"Migrations skipped due to configuration (`{SkipMigrationsSetting}` is {skipMigration})");

                if (!skipBootstrappers) 
                {
                    // find all seeders/bootstrappers and run them
                    var bootstrapperTypes = _typeFinder.Find(t => typeof(IBootstrapper).IsAssignableFrom(t) && t.IsClass).ToList();
                    bootstrapperTypes = SortByDependencies(bootstrapperTypes);

                    foreach (var bootstrapperType in bootstrapperTypes)
                    {
                        AsyncHelper.RunSync(async () =>
                        {
                            if (ioc.Resolve(bootstrapperType) is IBootstrapper bootstrapper)
                            {
                                Logger.Warn($"Run bootstrapper: {bootstrapperType.Name}...");

                                //var uowManager = ioc.Resolve<IUnitOfWorkManager>();
                                //using (var unitOfWork = uowManager.Begin())
                                //{
                                    await bootstrapper.Process();
                                    //await unitOfWork.CompleteAsync();
                                //}

                                Logger.Warn($"Run bootstrapper: {bootstrapperType.Name} - finished");
                            }
                        });
                    }
                }
                else
                    Logger.Warn($"Bootstrappers skipped due to configuration (`{SkipBootstrappersSetting}` is {skipBootstrappers})");

                // update the DB seeding time
                cache.Set(seedDbFinishedOnKey, initializationStart, TimeSpan.FromMinutes(10));
            });

            Logger.Warn(initializedByCurrentInstance 
                ? "Database initialization finished" : 
                "Database initialization skipped (locked by another instance)");

            //SeedHelper.SeedHostDb(IocManager);
        }

        private List<Type> SortByDependencies(List<Type> types)
        {
            var withDeps = types.Select(t => new
                {
                    Type = t,
                    Dependencies = t.GetAttribute<DependsOnAttribute>()?.DependedModuleTypes?.ToList()
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