using FluentMigrator;

namespace Shesha.Migrations.Workflows
{
    [Migration(20210423134800)]
    public class M20210423134800: AutoReversingMigration
    {
        public override void Up()
        {
            Create.Column("DueDate").OnTable("Core_ProcessableEntities").AsDateTime().Nullable();
        }
    }
}
