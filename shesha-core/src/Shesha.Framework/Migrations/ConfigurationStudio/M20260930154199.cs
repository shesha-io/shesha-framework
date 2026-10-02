using FluentMigrator;
using Shesha.FluentMigrator;
using System.Data;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20260930154199)]
    public class M20260930154199 : OneWayMigration
    {
        public override void Up()
        {
            // Shesha.Domain.FormConfigurationDependency
            Create.Table("form_configuration_dependencies").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("form_id").AsGuid().Nullable().Indexed()
                .WithColumn("is_satisfied").AsBoolean()
                .WithColumn("has_issues").AsBoolean()
                .WithColumn("module").AsString(200).Nullable()
                .WithColumn("name").AsString(200)
                .WithColumn("type").AsString(100);

            Create.ForeignKey("fk_form_configuration_dependencies_form_id")
                .FromTable("form_configuration_dependencies")
                .InSchema("frwk")
                .ForeignColumn("form_id")
                .ToTable("configuration_items")
                .InSchema("frwk")
                .PrimaryColumn("id")
                .OnDelete(Rule.Cascade);
        }
    }
}
