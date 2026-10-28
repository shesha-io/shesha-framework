using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20211223111500), MsSqlOnly]
    public class M20211223111500 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddForeignKeyColumn("ParentPropertyId", "Frwk_EntityProperties").Nullable();            
        }
    }
}
