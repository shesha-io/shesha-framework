using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250528152400)]
    public class M20250528152400 : OneWayMigration
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
