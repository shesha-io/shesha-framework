using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220209170599), MsSqlOnly]
    public class M20220209170599 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddColumn("IsFrameworkRelated").AsBoolean().SetExistingRowsTo(0);
        }
    }
}
