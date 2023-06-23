using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221006132100), MsSqlOnly]
    public class M20221006132100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityConfigs").AddForeignKeyColumn("ParentId", "Frwk_EntityConfigs").Nullable();
        }
    }
}
