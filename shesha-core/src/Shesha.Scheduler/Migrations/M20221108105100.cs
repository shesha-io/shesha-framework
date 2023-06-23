using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20221108105100), MsSqlOnly]
    public class M20221108105100 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ScheduledJobs")
                .AddColumn("LogModeLkp").AsInt32().Nullable();

            Alter.Table("Core_ScheduledJobExecutions")
                .AddForeignKeyColumn("LogFileId", "Frwk_StoredFiles");
        }
    }
}
