using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250724100800)]
    public class M20250724100800 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_FormConfigurations")
                .AddColumn("ConfigurationFormModule").AsString().Nullable()
                .AddColumn("ConfigurationFormName").AsString().Nullable()
                .AddColumn("GenerationLogicTypeName").AsString().Nullable()
                .AddColumn("PlaceholderIcon").AsString().Nullable()
                .AddColumn("GenerationLogicExtensionJson").AsStringMax().Nullable();

        }
    }
}
