using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20201029151300)]
    public class M20201029151300: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ScheduledJobExecutions")
                .AddForeignKeyColumn("ParentExecutionId", "Core_ScheduledJobExecutions");
        }
    }
}
