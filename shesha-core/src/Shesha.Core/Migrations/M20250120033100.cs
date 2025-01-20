using EasyNetQ;
using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250120033100)]
    public class M20250120033100 : Migration
    {
        public override void Up()
        {
            //fix the foreign key constraint
            IfDatabase("SqlServer").Execute.Sql(@"
                ALTER TABLE Core_NotificationMessageAttachments 
                DROP CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_NotificationMessages_Id;

                ALTER TABLE Core_NotificationMessageAttachments 
                ADD CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_NewNotificationMessages_Id
                FOREIGN KEY (MessageId) REFERENCES Core_NotificationMessages(Id);
            ");

            //rename the column
            Rename.Column("Core_CanOtpOut").OnTable("Core_NotificationTypeConfigs").To("Core_CanOptOut");
        }
        public override void Down()
        {


        }
    }
 
}
