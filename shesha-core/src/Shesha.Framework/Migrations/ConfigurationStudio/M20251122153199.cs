using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251122153199)]
    public class M20251122153199 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("creation_method_lkp").OnTable("configuration_item_revisions").InSchema("frwk").AsInt64().NotNullable().SetExistingRowsTo(1).WithDefaultValue(1);
        }
    }
}
