using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230222180499), MsSqlOnly]
    public class M20230222180499 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_SettingValues")
                .WithIdAsGuid()
                .WithAuditColumns()
                .WithColumn("Value").AsStringMax().Nullable()
                .WithForeignKeyColumn("SettingConfigurationId", "Frwk_SettingConfigurations")
                .WithForeignKeyColumn("ApplicationId", "Frwk_FrontEndApps");
        }
    }
}
