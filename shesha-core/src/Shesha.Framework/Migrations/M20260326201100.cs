using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260326201100)]
    public class M20260326201100 : OneWayMigration
    {
        public override void Up()
        {
            // reset permissioned objects md5 to update permissions with Inherited Access from the code
            Execute.Sql(@"update ""Frwk_PermissionedObjects"" set ""Md5"" = ''");
        }
    }
}