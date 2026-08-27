using FluentMigrator;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// #4619: restricts the permission management services to administrators.
    /// The database configuration of a permissioned object overrides the code level
    /// [SheshaAuthorize] attribute, so existing rows that still hold the previous default
    /// (`AnyAuthenticated`) have to be updated, otherwise the new code level default is ignored.
    /// Rows that were customized to any other access level are left untouched.
    /// </summary>
    [Migration(20260827120000)]
    public class M20260827120000 : OneWayMigration
    {
        public override void Up()
        {
            UpdateServiceAccess("Shesha.Permissions.PermissionedObjectAppService", ShaPermissionNames.Pages_Maintenance);
            UpdateServiceAccess("Shesha.Permissions.PermissionAppService", ShaPermissionNames.Application_Configurator);
        }

        private void UpdateServiceAccess(string serviceName, string permission)
        {
            Update.Table("permissioned_objects").InSchema("frwk")
                .Set(new
                {
                    access_lkp = (long)RefListPermissionedAccess.RequiresPermissions,
                    permissions = permission,
                })
                .Where(new
                {
                    @object = serviceName,
                    access_lkp = (long)RefListPermissionedAccess.AnyAuthenticated,
                });
        }
    }
}
