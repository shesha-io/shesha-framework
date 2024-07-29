using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240723172100)]
    public class M20240723172100 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("IsUserSpecific").OnTable("Frwk_SettingConfigurations").AsBoolean().WithDefaultValue(false);
            Create.Column("ClientAccessLkp").OnTable("Frwk_SettingConfigurations").AsInt64().WithDefaultValue(0).Nullable();

            Alter.Table("Frwk_SettingValues").AddForeignKeyColumnInt64("UserId", "AbpUsers").Nullable();
        }
    }
}
