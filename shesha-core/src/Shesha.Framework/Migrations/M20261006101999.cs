using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20261006101999)]
    public class M20261006101999 : OneWayMigration
    {
        public override void Up()
        {
            if (Schema.Table("Frwk_EntityConfigs").Exists())
                Create.Column("IsConfigurable").OnTable("Frwk_EntityConfigs").AsBoolean().WithDefaultValue(false).SetExistingRowsTo(false);
        }
    }
}
