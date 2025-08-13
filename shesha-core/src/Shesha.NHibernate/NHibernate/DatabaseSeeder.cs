using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.MultiTenancy;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Microsoft.Extensions.Configuration;
using Shesha.Attributes;
using Shesha.Bootstrappers;
using Shesha.FluentMigrator;
using Shesha.Locks;
using Shesha.Reflection;
using Shesha.Startup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.NHibernate
{
    public class DatabaseSeeder : IDatabaseSeeder, IDisposable
    {
        public const string SkipMigrationsSetting = "skipMigrations";
        public const string SkipBootstrappersSetting = "skipBootstrappers";

        const string seedDbKey = "AppStart:SeedDb";
        const string migrationDbFinishedOnKey = "MigrationDbFinishedOn";
        const string seedDbFinishedOnKey = "SeedDbFinishedOn";


        private readonly Castle.Core.Logging.ILogger _logger;
        private readonly IIocManager _ioc;
        private readonly ITypeFinder _typeFinder;
        private readonly ITypedCache<string, DateTime> _cache;
        private readonly IConfiguration _configuration;

        private ApplicationStartupDto? _startupDto;
        private bool _disposed;

        public DatabaseSeeder(Castle.Core.Logging.ILogger logger, IIocManager ioc)
        {
            _ioc = ioc;
            _logger = logger;
            _typeFinder = ioc.Resolve<ITypeFinder>();

            _configuration = _ioc.Resolve<IConfiguration>();

            var cacheManager = ioc.Resolve<ICacheManager>();
            _cache = cacheManager.GetCache<string, DateTime>(seedDbKey);
        }

        public async Task MigrateDatabaseAsync()
        {
            var skipMigration = _configuration.GetValue<bool>(SkipMigrationsSetting);

            if (skipMigration)
            {
                _logger.Warn($"Database migration skipped due to configuration (`{SkipMigrationsSetting}` is {skipMigration})");
                return;
            }

            var lockFactory = _ioc.Resolve<ILockFactory>();
            var cacheManager = _ioc.Resolve<ICacheManager>();

            // Note: the application may work in the multiple instance environment (e.g. on Azure)
            // We are trying to acquire a lock and initialize the application, possible cases:
            // 1. lock successfully acquired - initialize the application
            // 2. initialization is locked by another process - wait for completion and check the result of initialization. If the initialization failed - we can't continue the process and just throw exception

            _logger.Warn("Try to migrate database...");

            var expiry = TimeSpan.FromSeconds(30);
            var wait = TimeSpan.FromSeconds(10);
            var retry = TimeSpan.FromSeconds(1);

            var initializationStart = DateTime.Now.ToUniversalTime();
            var initializedByCurrentInstance = false;
            await lockFactory.DoExclusiveAsync(seedDbKey, expiry, wait, retry, async () =>
            {
                // get last initialization time
                var seedDbTime = await _cache.GetAsync(migrationDbFinishedOnKey, key => Task.FromResult(DateTime.MinValue));

                if (seedDbTime != DateTime.MinValue && (
                        seedDbTime.Ticks > initializationStart.Ticks || /* DB was initialized while we were waiting for the lock */
                        (initializationStart - seedDbTime).TotalSeconds <= 30 /* DB was initialized less than 30 seconds ago */
                    ))
                {
                    _logger.Warn("Database migrated by another application instance");
                    return;
                }

                var appStartup = _ioc.Resolve<IApplicationStartupSession>();

                initializedByCurrentInstance = true;
                _logger.Warn("Database migration started");

                // Check DB structure and log application start if possible
                var dbIsReadyForLogging = await appStartup.DbIsReadyForLoggingAsync();
                var appStartLogArgs = new LogApplicationStartArgs { MigrationsDisabled = skipMigration };
                _startupDto = dbIsReadyForLogging
                    ? _startupDto ?? await appStartup.LogApplicationStartAsync(appStartLogArgs)
                    : null;

                try
                {
                    if (!skipMigration)
                    {
                        _logger.Warn("Apply migrations...");
                        var dbMigrator = _ioc.Resolve<IAbpZeroDbMigrator>();
                        dbMigrator?.CreateOrMigrateForHost();
                        _logger.Warn("Apply migrations - finished");

                        _logger.Warn("Apply Auto migrations...");
                        var dbAutoMigrator = _ioc.Resolve<SheshaAutoDbMigrator>();
                        dbAutoMigrator?.CreateOrMigrateForHost();
                        _logger.Warn("Apply Auto migrations - finished");
                    }
                    else
                    {
                        if (!dbIsReadyForLogging)
                            throw new Exception("DB structure doesn't allow ther application to start. Make sure that database migration are switched on");

                        _logger.Warn($"Migrations skipped due to configuration (`{SkipMigrationsSetting}` is {skipMigration})");
                    }

                    // Log application start if DB was not ready for logging before the migrations
                    if (_startupDto == null)
                        _startupDto = await appStartup.LogApplicationStartAsync(appStartLogArgs);
                }
                catch (Exception e)
                {
                    if (_startupDto != null)
                    {
                        await appStartup.StartupFailedAsync(_startupDto.Id, e);
                    }
                    throw;
                }

                // update the DB seeding time
                await _cache.SetAsync(migrationDbFinishedOnKey, initializationStart, TimeSpan.FromMinutes(10));
            });

            _logger.Warn(initializedByCurrentInstance
                ? "Database migration finished" :
                "Database migration skipped (locked by another instance)");
        }

        public async Task BootstrapDatabaseAsync()
        {
            var skipBootstrappers = _configuration.GetValue<bool>(SkipBootstrappersSetting);

            if (skipBootstrappers)
            {
                _logger.Warn($"Database bootstrapping skipped due to configuration (`{SkipBootstrappersSetting}` is {skipBootstrappers})");
                return;
            }

            var lockFactory = _ioc.Resolve<ILockFactory>();

            // Note: the application may work in the multiple instance environment (e.g. on Azure)
            // We are trying to acquire a lock and initialize the application, possible cases:
            // 1. lock successfully acquired - initialize the application
            // 2. initialization is locked by another process - wait for completion and check the result of initialization. If the initialization failed - we can't continue the process and just throw exception

            _logger.Warn("Try to bootstrap database...");

            var expiry = TimeSpan.FromSeconds(30);
            var wait = TimeSpan.FromSeconds(10);
            var retry = TimeSpan.FromSeconds(1);

            var initializationStart = DateTime.Now.ToUniversalTime();
            var initializedByCurrentInstance = false;
            await lockFactory.DoExclusiveAsync(seedDbKey, expiry, wait, retry, async () =>
            {
                // get last initialization time
                var seedDbTime = await _cache.GetAsync(seedDbFinishedOnKey, key => Task.FromResult(DateTime.MinValue));

                if (seedDbTime != DateTime.MinValue && (
                        seedDbTime.Ticks > initializationStart.Ticks || /* DB was initialized while we were waiting for the lock */
                        (initializationStart - seedDbTime).TotalSeconds <= 30 /* DB was initialized less than 30 seconds ago */
                    ))
                {
                    _logger.Warn("Database bootstrapped by another application instance");
                    return;
                }

                var appStartup = _ioc.Resolve<IApplicationStartupSession>();

                initializedByCurrentInstance = true;
                _logger.Warn("Database bootstrapping started");

                // Check DB structure and log application start if possible
                var dbIsReadyForLogging = await appStartup.DbIsReadyForLoggingAsync();
                var appStartLogArgs = new LogApplicationStartArgs { BootstrappersDisabled = skipBootstrappers };
                _startupDto = dbIsReadyForLogging
                    ? _startupDto ?? await appStartup.LogApplicationStartAsync(appStartLogArgs)
                    : null;

                try
                {
                    // Log application start if DB was not ready for logging before the migrations
                    if (_startupDto == null)
                        _startupDto = await appStartup.LogApplicationStartAsync(appStartLogArgs);

                    // find all seeders/bootstrappers and run them
                    var bootstrapperTypes = _typeFinder.Find(t => typeof(IBootstrapper).IsAssignableFrom(t) && t.IsClass).ToList();
                    bootstrapperTypes = SortByDependencies(bootstrapperTypes);

                    var allSkipped = true;

                    foreach (var bootstrapperType in bootstrapperTypes)
                    {
                        if (_ioc.IsRegistered(bootstrapperType) && _ioc.Resolve(bootstrapperType) is IBootstrapper bootstrapper)
                        {
                            _logger.Warn($"Run bootstrapper: {bootstrapperType.Name}...");

                            allSkipped = !(await bootstrapper.ProcessAsync(false)) && allSkipped;

                            _logger.Warn($"Run bootstrapper: {bootstrapperType.Name} - finished");
                        }
                    }

                    if (appStartup.AllAssembliesStayUnchanged && allSkipped)
                        _logger.Warn($"Bootstrappers skipped. Previous startup was full, successful and all assemblies stay unchanged");


                    await appStartup.StartupSuccessAsync(_startupDto.Id);
                }
                catch (Exception e)
                {
                    if (_startupDto != null)
                    {
                        await appStartup.StartupFailedAsync(_startupDto.Id, e);
                    }
                    throw;
                }

                // update the DB seeding time
                await _cache.SetAsync(seedDbFinishedOnKey, initializationStart, TimeSpan.FromMinutes(10));
            });

            _logger.Warn(initializedByCurrentInstance
                ? "Database bootstrapping finished" :
                "Database bootstrapping skipped (locked by another instance)");
        }

        public async Task InitDataFromDatabaseAsync()
        {
            _logger.Warn("Initialization data from Database started");

            // find all initializators and run them
            var initializatorTypes = _typeFinder.Find(t => typeof(IInitializatorFromDb).IsAssignableFrom(t) && t.IsClass).ToList();
            initializatorTypes = SortByDependencies(initializatorTypes);

            foreach (var initializatorType in initializatorTypes)
            {
                if (_ioc.IsRegistered(initializatorType) && _ioc.Resolve(initializatorType) is IInitializatorFromDb initializator)
                {
                    _logger.Warn($"Run initializator: {initializatorType.Name}...");

                    var method = initializatorType.GetRequiredMethod(nameof(IInitializatorFromDb.ProcessAsync));
                    var unitOfWorkAttribute = method.GetAttributeOrNull<UnitOfWorkAttribute>(true);
                    var useDefaultUnitOfWork = unitOfWorkAttribute == null || !unitOfWorkAttribute.IsDisabled;

                    if (useDefaultUnitOfWork)
                    {
                        var uowManager = _ioc.Resolve<IUnitOfWorkManager>();
                        using (var unitOfWork = uowManager.Begin())
                        {
                            await initializator.ProcessAsync();
                            await unitOfWork.CompleteAsync();
                        }
                    }
                    else
                        await initializator.ProcessAsync();

                    _logger.Warn($"Run initializator: {initializatorType.Name} - finished");
                }
            }

            _logger.Warn("Initialization data from Database finished");

        }

        public virtual void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _cache.Dispose();

            _disposed = true;
        }

        protected virtual void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }

        private List<Type> SortByDependencies(List<Type> types)
        {
            var withDeps = types.Select(t => new
            {
                Type = t,
                Dependencies = t.GetAttributeOrNull<DependsOnTypesAttribute>()?.DependedTypes?.ToList()
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
    }
}