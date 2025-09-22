using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250915174900)]
    public class M20250915174900 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("form_configurations").InSchema("frwk")
                .AddColumn("template_id").AsGuid().Nullable().ForeignKey("fk_form_configurations_template_id", "frwk", "form_configurations", "id").Indexed();
        }
    }
}