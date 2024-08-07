using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240801180300)]
    public class M20240801180300 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("IsUserSpecific").OnTable("Frwk_SettingConfigurations").AsBoolean().WithDefaultValue(false);
            Create.Column("ClientAccessLkp").OnTable("Frwk_SettingConfigurations").AsInt64().WithDefaultValue(0).Nullable();

            Alter.Table("Frwk_SettingValues").AddForeignKeyColumnInt64("UserId", "AbpUsers").Nullable();

            // Drop the existing unique constraint
            Delete.UniqueConstraint("uq_Frwk_SettingValues_Setting_App")
                .FromTable("Frwk_SettingValues");

            // Create the new unique constraint including UserId
            Create.UniqueConstraint("uq_Frwk_SettingValues_Setting_App_User")
                .OnTable("Frwk_SettingValues")
                .Columns("SettingConfigurationId", "ApplicationId", "UserId");
        }
    }
}
