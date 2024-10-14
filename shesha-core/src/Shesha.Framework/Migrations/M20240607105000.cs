using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240607105000)]
    public class M20240607105000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
alter table Frwk_PermissionedObjects drop column Module
go
alter table Frwk_PermissionedObjects add ModuleId uniqueidentifier null
go
");

            IfDatabase("PostgreSql").Execute.Sql(@"
alter table ""Frwk_PermissionedObjects"" drop column ""Module"";
alter table ""Frwk_PermissionedObjects"" add ""ModuleId"" uuid null;
");
        }
    }
}
