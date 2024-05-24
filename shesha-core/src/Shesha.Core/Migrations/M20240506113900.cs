using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240506113900)]
    public class M20240506113900 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
update ci set ItemType = 'role'
from Frwk_ConfigurationItems ci
where ItemType = 'shesha-role'
");
        }
    }
}
