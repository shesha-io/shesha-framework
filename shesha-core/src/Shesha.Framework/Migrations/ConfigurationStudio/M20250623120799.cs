using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120799)]
    public class M20250623120799 : OneWayMigration
    {
        public override void Up()
        {
            // Shesha.Domain.ModuleRelation
            Create.Table("module_relations").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("level").AsInt32();

            // Shesha.Domain.ModuleRelation
            Alter.Table("module_relations").InSchema("frwk")
                .AddColumn("base_module_id").AsGuid().Nullable().ForeignKey("fk_module_relations_base_module_id", "frwk", "modules", "id").Indexed()
                .AddColumn("module_id").AsGuid().Nullable().ForeignKey("fk_module_relations_module_id", "frwk", "modules", "id").Indexed();
        }
    }
}
