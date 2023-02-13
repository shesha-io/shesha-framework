using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200427164600)]
    public class M20200427164600: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_WorkflowInstances").AddForeignKeyColumn("ProcessableEntityId", "Core_ProcessableEntities");
        }
    }
}
