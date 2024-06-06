using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240502101000)]
    public class M20240502101000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
update ci set ItemType = 'shesha-role'
from Core_ShaRoles pd
inner join Frwk_ConfigurationItems ci on ci.id = pd.id

alter table Core_ShaRoles drop column Name;
go
alter table Core_ShaRoles drop column Description;
go
");

            IfDatabase("PostgreSql").Execute.Sql(@"
alter table ""Core_ShaRoles"" drop column ""Name"";
alter table ""Core_ShaRoles"" drop column ""Description"";
");
        }
    }
}
