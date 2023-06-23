using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230310094299), MsSqlOnly]
    public class M20230310094299 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from Frwk_SettingValues");
            Execute.Sql(@"delete from Frwk_SettingConfigurations");
            Execute.Sql(@"delete from Frwk_ConfigurationItems where ItemType = 'setting-configuration'");

            Delete.Index("IX_Frwk_SettingValues_SettingConfigurationId").OnTable("Frwk_SettingValues");
            Delete.ForeignKey("FK_Frwk_SettingValues_SettingConfigurationId_Frwk_SettingConfigurations_Id").OnTable("Frwk_SettingValues");

            Alter.Column("SettingConfigurationId").OnTable("Frwk_SettingValues").AsGuid().NotNullable();
            
            Create.Index("IX_Frwk_SettingValues_SettingConfigurationId").OnTable("Frwk_SettingValues").OnColumn("SettingConfigurationId");
            Create.ForeignKey("FK_Frwk_SettingValues_SettingConfigurationId_Frwk_SettingConfigurations_Id").FromTable("Frwk_SettingValues")
                .ForeignColumn("SettingConfigurationId")
                .ToTable("Frwk_SettingConfigurations")
                .PrimaryColumn("Id");

            Create.UniqueConstraint("uq_Frwk_SettingValues_Setting_App").OnTable("Frwk_SettingValues").Columns("SettingConfigurationId", "ApplicationId");
        }
    }
}
