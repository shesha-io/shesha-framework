using Abp.Dependency;
using Abp.Extensions;
using Abp.MultiTenancy;
using Abp.Reflection;
using Castle.Core.Logging;
using FluentMigrator.Runner;
using FluentMigrator.Runner.Conventions;
using FluentMigrator.Runner.Initialization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Shesha.FluentMigrator.Conventions;
using System.Configuration;
using System.Globalization;

namespace Shesha.FluentMigrator
{
    // todo: move to Shesha.FluentMigrator
    public class SheshaDbMigrator : IAbpZeroDbMigrator, ITransientDependency
    {
        /// <summary>
        /// Format of the migration version
        /// </summary>
        const string MigrationVersionFormat = "yyyyMMddHHmmff";

        private readonly IAssemblyFinder _assemblyFinder;
        private readonly IDbConnectionSettingsResolver _connectionSettingsResolver;
        private readonly IModuleLocator _moduleLocator;
        

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SheshaDbMigrator(IDbConnectionSettingsResolver connectionSettingsResolver, IAssemblyFinder assemblyFinder, IModuleLocator moduleLocator)
        {
            _connectionSettingsResolver = connectionSettingsResolver;
            _assemblyFinder = assemblyFinder;
            _moduleLocator = moduleLocator;
        }

        public virtual void CreateOrMigrateForHost()
        {
            CreateOrMigrateForHost(null);
        }

        public virtual void CreateOrMigrateForHost(Action? seedAction)
        {
            CreateOrMigrate(null, seedAction);
        }


        public virtual void CreateOrMigrateForTenant(AbpTenantBase tenant)
        {
            CreateOrMigrateForTenant(tenant, null);
        }

        public virtual void CreateOrMigrateForTenant(AbpTenantBase tenant, Action? seedAction)
        {
            if (tenant.ConnectionString.IsNullOrEmpty())
                return;

            CreateOrMigrate(tenant, seedAction);
        }

        /// <summary>
        /// Configure the dependency injection services
        /// </summary>
        private IServiceProvider CreateServices(IDbConnectionSettings connectionSettings)
        {
            var services = new ServiceCollection();
            services.TryAddSingleton<IModuleLocator>(_moduleLocator);
            
            services
                // Add common FluentMigrator services
                .AddFluentMigratorCore()
                .ConfigureRunner(rb =>
                    {
                        rb.WithGlobalCommandTimeout(TimeSpan.FromMinutes(30));

                        switch (connectionSettings.DbmsType)
                        {
                            case DbmsType.SQLServer:
                                {
                                    rb.AddSqlServer2012();
                                    break;
                                }
                            case DbmsType.PostgreSQL:
                                {
                                    rb.AddPostgres();
                                    break;
                                }
                            default:
                                throw new DbmsTypeNotSpecified();
                        }
                        rb.WithGlobalConnectionString(connectionSettings.ConnectionString);

                        var assemblies = _assemblyFinder.GetAllAssemblies();
                        foreach (var assembly in assemblies)
                        {
                            // Define the assembly containing the migrations
                            rb.ScanIn(assembly).For.Migrations().For.EmbeddedResources();
                        }
                    }
                )

                // Enable logging to console in the FluentMigrator way
                .AddLogging(lb => lb.AddFluentMigratorConsole())
                // Start of type filter configuration
                .Configure<RunnerOptions>(opt =>
                {
                    opt.Tags = new[] { connectionSettings.DbmsType.ToString() };
                });

            if (connectionSettings.DbmsType == DbmsType.PostgreSQL) 
            {
                // register custom conventions for PostgreSql. It forces to use citext for string columns in the create statements
                services.AddSingleton<IConventionSet>(new PostgreSqlConventionsSet());
            }

            return services.BuildServiceProvider(false);            
        }

        /// <summary>
        /// Update the database
        /// </summary>
        private void CreateOrMigrate(AbpTenantBase? tenant, Action? seedAction)
        {
            var args = new DbPerTenantConnectionStringResolveArgs(
                tenant == null ? (int?)null : (int?)tenant.Id,
                tenant == null ? MultiTenancySides.Host : MultiTenancySides.Tenant
            );

            var dbmsType = _connectionSettingsResolver.GetDbmsType(args);
            var connectionString = GetConnectionString(
                _connectionSettingsResolver.GetNameOrConnectionString(args)
            );

            // Put the database update into a scope to ensure
            // that all resources will be disposed.
            var connectionSettings = new DbConnectionSettings(dbmsType, connectionString);
            using var scope = CreateServices(connectionSettings).CreateScope();
            using var connectionSettingsScope = DbConnectionSettings.BeginConnectionScope(connectionSettings);

            // Instantiate the runner
            var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
            var migrations = runner.MigrationLoader.LoadMigrations();

            var invalidMigrationVersions = migrations.Keys
                .Select(v => v.ToString())
                .Where(v => v.Length != MigrationVersionFormat.Length || !DateTime.TryParseExact(v, MigrationVersionFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var migrationDate))
                .ToList();
            if (invalidMigrationVersions.Any())
                throw new WrongMigrationVersionsFoundException(MigrationVersionFormat, invalidMigrationVersions);

            try
            {
                if (runner is MigrationRunner standardRunner)
                {
                    var migrationsToApply = standardRunner.MigrationLoader.LoadMigrations().Where(mi => !standardRunner.VersionLoader.VersionInfo.HasAppliedMigration(mi.Key)).OrderBy(m => m.Key).ToList();
                    Logger.Info($"Found {migrationsToApply.Count()} migrations to apply");

                    foreach (var migration in migrationsToApply)
                    {
                        var migrationName = migration.Value.Migration.GetType().FullName;

                        Logger.Info($"Applying migration {migrationName} (version={migration.Value.Version})...");
                        try
                        {
                            standardRunner.MigrateUp(migration.Value.Version);
                            Logger.Info($"Migration {migrationName} (version={migration.Value.Version}) applied successfully");
                        }
                        catch (Exception e)
                        {
                            Logger.Error($"Failed to apply migration {migrationName} (version={migration.Value.Version})", e);
                            throw;
                        }
                    }
                }
                else
                    runner.MigrateUp();
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets connection string from given connection string or name.
        /// </summary>
        private static string GetConnectionString(string nameOrConnectionString)
        {
            var connStrSection = ConfigurationManager.ConnectionStrings[nameOrConnectionString];
            if (connStrSection != null)
            {
                return connStrSection.ConnectionString;
            }

            return nameOrConnectionString;
        }
    }
}
