using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250618201500)]
    public class M20250618201500 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_FormConfigurations")
                .AddForeignKeyColumn("ConfigurationFormId", "Frwk_FormConfigurations")
                .AddColumn("GenerationLogicTypeName").AsString().Nullable()
                .AddColumn("PlaceholderIcon").AsString().Nullable()
                .AddColumn("GenerationLogicExtensionJson").AsStringMax().Nullable();

        }
    }
}
