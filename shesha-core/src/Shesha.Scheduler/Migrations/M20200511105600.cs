using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20200511105600)]
    public class M20200511105600: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Scheduler.Domain.ScheduledJob
            Create.Table("Core_ScheduledJobs")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("JobDescription").AsStringMax().Nullable()
                .WithColumn("JobName").AsString(300).Nullable()
                .WithColumn("JobNamespace").AsString(300).Nullable()
                .WithColumn("JobStatusLkp").AsInt32()
                .WithColumn("StartupModeLkp").AsInt32();

            // Shesha.Scheduler.Domain.ScheduledJobTrigger
            Create.Table("Core_ScheduledJobTriggers")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("CronString").AsString(100).Nullable()
                .WithColumn("Description").AsString(1000).Nullable()
                .WithForeignKeyColumn("JobId", "Core_ScheduledJobs")
                .WithColumn("ParametersJson").AsStringMax().Nullable()
                .WithColumn("StatusLkp").AsInt32();

            // Shesha.Scheduler.Domain.ScheduledJobExecution
            Create.Table("Core_ScheduledJobExecutions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ErrorMessage").AsStringMax().Nullable()
                .WithColumn("FinishedOn").AsDateTime().Nullable()
                .WithForeignKeyColumn("JobId", "Core_ScheduledJobs")
                .WithColumn("LogFilePath").AsString(500).Nullable()
                .WithForeignKeyColumnInt64("StartedById", "AbpUsers")
                .WithColumn("StartedOn").AsDateTime().Nullable()
                .WithColumn("StatusLkp").AsInt32()
                .WithForeignKeyColumn("TriggerId", "Core_ScheduledJobTriggers");
        }
    }
}
