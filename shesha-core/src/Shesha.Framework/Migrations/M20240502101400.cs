using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240502101400)]
    public class M20240502101400 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
alter table Frwk_PermissionDefinitions drop column Name;
go
alter table Frwk_PermissionDefinitions drop column Description;
go
alter table Frwk_PermissionDefinitions drop column DisplayName;
go
");

            IfDatabase("PostgreSql").Execute.Sql(@"
alter table ""Frwk_PermissionDefinitions"" drop column ""Name"";
alter table ""Frwk_PermissionDefinitions"" drop column ""Description"";
alter table ""Frwk_PermissionDefinitions"" drop column ""DisplayName"";
");

        }
    }
}
