using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20261016141999)]
    public class M20261016141999 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("is_configurable").OnTable("entity_configs").InSchema("frwk").AsBoolean().WithDefaultValue(false).SetExistingRowsTo(false);
        }
    }
}
