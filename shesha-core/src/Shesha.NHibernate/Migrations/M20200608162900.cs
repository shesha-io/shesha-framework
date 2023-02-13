using System;
using System.Collections.Generic;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200608162900)]
    public class M20200608162900: Migration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_Core_Notifications_TaskDistributionListId_Core_DistributionLists_Id").OnTable("Core_Notifications");
            Delete.Index($"IX_Core_Notifications_TaskDistributionListId").OnTable("Core_Notifications");

            Delete.ForeignKey("FK_Core_Notifications_TaskEscalationDistributionListId_Core_DistributionLists_Id").OnTable("Core_Notifications");
            Delete.Index($"IX_Core_Notifications_TaskEscalationDistributionListId").OnTable("Core_Notifications");


            var columns = new List<string>
            {
                "EscalateAfterSla",
                "InitiateTask",
                "NotifyByEmail",
                "NotifyByPush",
                "NotifyBySms",
                "SlaHours",
                "TaskActionName",
                "TaskDescription",
                "TaskDistributionListId",
                "TaskEscalationDistributionListId"
            };

            foreach (var column in columns)
            {
                Delete.Column(column).FromTable("Core_Notifications");
            }
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
