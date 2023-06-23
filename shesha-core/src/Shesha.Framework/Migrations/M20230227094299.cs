using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230227094299), MsSqlOnly]
    public class M20230227094299 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_SettingConfigurations").AddColumn("Category").AsString(200).Nullable();
        }
    }
}
