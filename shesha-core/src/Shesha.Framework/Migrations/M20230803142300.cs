using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230803142300)]
    public class M20230803142300 : Migration
    {
        public override void Down()
        {
            throw new System.NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql("delete from Frwk_PermissionedObjects where AccessLkp = 2 and (Permissions is null or Permissions = '')");
            Execute.Sql("update Frwk_PermissionedObjects set Type = 'Shesha.Entity' where Type = 'entity' and not Object like '%@%'");
            Execute.Sql("update Frwk_PermissionedObjects set Type = 'Shesha.Entity.Action' where Type = 'Shesha.Entity' and Object like '%@%'");

            Create.Index("IX_Frwk_PermissionedObjects_Object").OnTable("Frwk_PermissionedObjects").OnColumn("Object");
            Create.Index("IX_Frwk_PermissionedObjects_Parent").OnTable("Frwk_PermissionedObjects").OnColumn("Parent");
        }
    }
}
