using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230220103499), MsSqlOnly]
    public class M20230220103499 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_SettingConfigurations")
                .WithIdAsGuid()
                .WithColumn("DataType").AsString(100)
                .WithColumn("EditorFormName").AsString(200).Nullable()
                .WithColumn("EditorFormModule").AsString(200).Nullable()
                .WithColumn("OrderIndex").AsInt32()
                .WithColumn("IsClientSpecific").AsBoolean()
                .WithColumn("AccessModeLkp").AsInt64();

            Create.ForeignKey("FK_Frwk_SettingConfigurations_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_SettingConfigurations")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");
        }
    }
}
