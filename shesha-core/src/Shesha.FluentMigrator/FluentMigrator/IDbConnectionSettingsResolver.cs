using Abp.MultiTenancy;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Database connection settings provider
    /// </summary>
    public interface IDbConnectionSettingsResolver: IDbPerTenantConnectionStringResolver
    {
        /// <summary>
        /// Get DBMS type
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        DbmsType GetDbmsType(DbPerTenantConnectionStringResolveArgs args);
    }
}
