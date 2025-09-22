using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250915174100)]
    public class M20250915174100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("form_configurations").InSchema("frwk")
                .AddColumn("configuration_form_module").AsString(200).Nullable()
                .AddColumn("configuration_form_name").AsString(200).Nullable()
                .AddColumn("generation_logic_type_name").AsString(200).Nullable()
                .AddColumn("placeholder_icon").AsString(100).Nullable()
                .AddColumn("generation_logic_extension_json").AsStringMax().Nullable();
        }
    }
}