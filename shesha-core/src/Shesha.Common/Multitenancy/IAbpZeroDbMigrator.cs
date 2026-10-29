namespace Shesha.MultiTenancy
{
    public interface IAbpZeroDbMigrator
    {
        void CreateOrMigrateForHost();

        void CreateOrMigrateForTenant(AbpTenantBase tenant);
    }
}