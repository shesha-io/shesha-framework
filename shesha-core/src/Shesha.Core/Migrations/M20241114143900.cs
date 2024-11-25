using FluentMigrator;
using NUglify;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20241114143900)]
    public class M20241114143900 : Migration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_Core_OmoNotificationMessageAttachments_PartOfId_Core_NotificationMessages_Id").OnTable("Core_OmoNotificationMessageAttachments");
            Delete.Index("IX_Core_OmoNotificationMessageAttachments_PartOfId").OnTable("Core_OmoNotificationMessageAttachments");
            Delete.Column("PartOfId").FromTable("Core_OmoNotificationMessageAttachments");


            Alter.Table("Core_OmoNotificationMessageAttachments")
                .AddForeignKeyColumn("PartOfId", "Core_OmoNotificationMessages");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
