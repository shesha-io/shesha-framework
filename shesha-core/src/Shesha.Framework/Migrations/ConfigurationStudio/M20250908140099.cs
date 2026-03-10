using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250908140099)]
    public class M20250908140099 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("configuration_json").OnTable("configuration_item_revisions").InSchema("frwk").AsStringMax().NotNullable().SetExistingRowsTo("{}");

            Alter.Table("configuration_items").InSchema("frwk")
                .AddColumn("label").AsString(200).Nullable()
                .AddColumn("description").AsStringMax().Nullable();
        }
    }
}
