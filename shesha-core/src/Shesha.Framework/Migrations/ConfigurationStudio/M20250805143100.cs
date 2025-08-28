using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250805143100)]
    public class M20250805143100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("form_configuration_revisions").InSchema("frwk")
                .AddColumn("template_id").AsGuid().Nullable().ForeignKey("fk_form_configuration_revisions_template_id", "frwk", "form_configuration_revisions", "id").Indexed();
        }
    }
}
