using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251110113300)]
    public class M20251110113300 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("Frwk_FormConfigurations").Column("ConfigurationFormModule").Exists())
            {
                Alter.Table("Frwk_FormConfigurations")
                    .AddColumn("ConfigurationFormModule").AsString().Nullable();
            }

            if (!Schema.Table("Frwk_FormConfigurations").Column("ConfigurationFormName").Exists())
            {
                Alter.Table("Frwk_FormConfigurations")
                    .AddColumn("ConfigurationFormName").AsString().Nullable();
            }

            if (!Schema.Table("Frwk_FormConfigurations").Column("GenerationLogicTypeName").Exists())
            {
                Alter.Table("Frwk_FormConfigurations")
                    .AddColumn("GenerationLogicTypeName").AsString().Nullable();
            }

            if (!Schema.Table("Frwk_FormConfigurations").Column("PlaceholderIcon").Exists())
            {
                Alter.Table("Frwk_FormConfigurations")
                    .AddColumn("PlaceholderIcon").AsString().Nullable();
            }

            if (!Schema.Table("Frwk_FormConfigurations").Column("GenerationLogicExtensionJson").Exists())
            {
                Alter.Table("Frwk_FormConfigurations")
                    .AddColumn("GenerationLogicExtensionJson").AsStringMax().Nullable();
            }
        }
    }
}
