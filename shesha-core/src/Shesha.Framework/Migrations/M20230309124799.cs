using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230309124799), MsSqlOnly]
    public class M20230309124799 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("DataFormat").OnTable("Frwk_SettingConfigurations").AsString(100).Nullable();
            Create.Column("ReferenceListName").OnTable("Frwk_SettingConfigurations").AsString(400).Nullable();
            Create.Column("ReferenceListModule").OnTable("Frwk_SettingConfigurations").AsString(400).Nullable();
        }
    }
}
