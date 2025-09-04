using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250730081100)]
    public class M20250730081100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("form_configuration_revisions").InSchema("frwk")
                .AddColumn("configuration_form_module").AsString().Nullable()
                .AddColumn("configuration_form_name").AsString().Nullable()
                .AddColumn("generation_logic_type_name").AsString().Nullable()
                .AddColumn("placeholder_icon").AsString().Nullable()
                .AddColumn("generation_logic_extension_json").AsStringMax().Nullable();
        }
    }
}