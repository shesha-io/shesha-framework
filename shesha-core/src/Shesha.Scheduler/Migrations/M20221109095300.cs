using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20221109095300), MsSqlOnly]
    public class M20221109095300 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ScheduledJobs")
                .AddColumn("LogFolder").AsStringMax().Nullable();
        }
    }
}
