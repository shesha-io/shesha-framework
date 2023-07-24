using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20221113071500), MsSqlOnly]
    public class M20221113071500 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ScheduledJobs")
                .AddColumn("JobType").AsStringMax().Nullable();
        }
    }
}
