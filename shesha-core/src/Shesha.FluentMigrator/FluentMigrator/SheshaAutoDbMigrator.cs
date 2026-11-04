using Abp.Dependency;
using Abp.MultiTenancy;
using Abp.Reflection;
using FluentMigrator.Runner;
using Microsoft.Extensions.DependencyInjection;

namespace Shesha.FluentMigrator
{
    public class SheshaAutoDbMigrator : SheshaDbMigrator
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IIocManager _iocManager;

        public SheshaAutoDbMigrator(
            IDbConnectionSettingsResolver connectionSettingsResolver,
            IAssemblyFinder assemblyFinder,
            IModuleLocator moduleLocator,
            ITypeFinder typeFinder,
            IIocManager iocManager
            ) : base(connectionSettingsResolver, assemblyFinder, moduleLocator)
        {
            _typeFinder = typeFinder;
            _iocManager = iocManager;
        }

        protected override void CreateOrMigrate(AbpTenantBase? tenant, Action? seedAction)
        {
            var args = new DbPerTenantConnectionStringResolveArgs(
                tenant == null ? (int?)null : (int?)tenant.Id,
                tenant == null ? MultiTenancySides.Host : MultiTenancySides.Tenant
            );

            var dbmsType = _connectionSettingsResolver.GetDbmsType(args);
            var connectionString = GetConnectionString(_connectionSettingsResolver.GetNameOrConnectionString(args));

            // Put the database update into a scope to ensure
            // that all resources will be disposed.
            var connectionSettings = new DbConnectionSettings(dbmsType, connectionString);
            using var services = CreateServices(connectionSettings);
            using var scope = services.CreateScope();
            using var connectionSettingsScope = DbConnectionSettings.BeginConnectionScope(connectionSettings);

            // Instantiate the runner
            var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();

            try
            {
                var types = _typeFinder.Find(x => x.IsAssignableTo(typeof(ISheshaAutoDbMigration)));
                foreach (var type in types)
                {
                    if (_iocManager.IsRegistered(type) && _iocManager.Resolve(type) is ISheshaAutoDbMigration migration)
                    {
                        runner.Up(migration);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
