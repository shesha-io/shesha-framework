using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20231031153500)]
    public class M20231031153500 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_MobileDevices").AddColumn("Frwk_Discriminator").AsString().WithDefaultValue("");

        }
    }
}
