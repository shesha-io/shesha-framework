using System;
using FluentMigrator;

namespace Shesha.Scheduler.Migrations
{
    [Migration(20200713155400)]
    public class M20200713155400: Migration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from Core_ScheduledJobTriggers where JobId is null");

            Delete.Index("IX_Core_ScheduledJobTriggers_JobId").OnTable("Core_ScheduledJobTriggers");
            
            Alter.Column("JobId").OnTable("Core_ScheduledJobTriggers").AsGuid().NotNullable();
            
            Create.Index("IX_Core_ScheduledJobTriggers_JobId").OnTable("Core_ScheduledJobTriggers").OnColumn("JobId");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
