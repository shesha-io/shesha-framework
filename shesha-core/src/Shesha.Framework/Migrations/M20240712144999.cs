using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240712144999)]
    public class M20240712144999 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"ALTER VIEW IF EXISTS vw_Frwk_PermissionedObjectsFull RENAME TO ""vw_Frwk_PermissionedObjectsFull""");

            if (Schema.Table("Core_PublicHolidays").Exists())
                Delete.Table("Core_PublicHolidays");
        }
    }
}
