using FluentMigrator;
using Shesha.Domain.Enums;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// #4625: `ChangePasswordAsync` no longer carries `[AbpAllowAnonymous]`, but databases that were
    /// seeded while it did still hold an `AllowAnonymous` row for the endpoint.
    /// `PermissionedObjectsBootstrapper` only overwrites the stored access when the code level
    /// definition is hardcoded or the stored access is `Inherited`; after the attribute was removed
    /// neither holds, so the stale row survives every restart. `ObjectPermissionChecker` then treats
    /// the endpoint as anonymous and returns without throwing, the request reaches the method body
    /// and `AbpSession.GetUserId()` throws `AbpException`, which surfaces as HTTP 500 instead of 401.
    /// Resetting the row to `Inherited` restores the value a fresh installation seeds, so the access
    /// falls back to the `DefaultEndpointAccess` security setting as it does for every other endpoint.
    /// Rows customised to any other access level are left untouched.
    /// </summary>
    [Migration(20260828074399)]
    public class M20260828074399 : OneWayMigration
    {
        public override void Up()
        {
            Update.Table("permissioned_objects").InSchema("frwk")
                .Set(new
                {
                    access_lkp = (long)RefListPermissionedAccess.Inherited,
                    hardcoded = false,
                })
                .Where(new
                {
                    @object = "Shesha.Users.UserAppService@ChangePassword",
                    access_lkp = (long)RefListPermissionedAccess.AllowAnonymous,
                });
        }
    }
}
