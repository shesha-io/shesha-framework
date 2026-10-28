using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20211221165000), MsSqlOnly]
    public class M20211221165000 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Column("SortOrder").OnTable("Frwk_EntityProperties").AsInt32().Nullable();
        }
    }
}
