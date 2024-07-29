using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240729125600)]
    public class M20240729125600 : OneWayMigration
    {
        public override void Up()
        {
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
