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
            //  Changed the FK Constraint name on the table Core_NotificationMessageAttachments
            IfDatabase("SqlServer").Execute.Sql(@"
                 ALTER TABLE Core_NotificationMessageAttachments 
                 DROP CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_NotificationMessages_Id;

                 ALTER TABLE Core_NotificationMessageAttachments 
                 ADD CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_NewNotificationMessages_Id
                 FOREIGN KEY (MessageId) REFERENCES Core_NotificationMessages(Id);
             ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                 ALTER TABLE ""Core_NotificationMessageAttachments"" 
                 DROP CONSTRAINT ""FK_Core_NotificationMessageAttachments_MessageId_Core_NotificationMessages_Id"";

                 ALTER TABLE ""Core_NotificationMessageAttachments"" 
                 ADD CONSTRAINT ""FK_Core_NotificationMessageAttachments_MessageId_Core_NewNotificationMessages_Id""
                 FOREIGN KEY (""MessageId"") REFERENCES ""Core_NotificationMessages""(""Id"");
             ");

            //  Changed the FK Constraint name on the table SM_EscalationRules
            IfDatabase("SqlServer").Execute.Sql(@"
                 ALTER TABLE SM_EscalationRules 
                 DROP CONSTRAINT FK_SM_EscalationRules_NotificationId_Core_Notifications_Id

                 ALTER TABLE SM_EscalationRules
                 ADD CONSTRAINT FK_SM_EscalationRules_NotificationId_Core_NewNotifications_Id
                 FOREIGN KEY (NotificationId) REFERENCES Core_Notifications(Id);
             ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                 ALTER TABLE ""SM_EscalationRules"" 
                 DROP CONSTRAINT ""FK_SM_EscalationRules_NotificationId_Core_Notifications_Id"";

                 ALTER TABLE ""SM_EscalationRules""
                 ADD CONSTRAINT ""FK_SM_EscalationRules_NotificationId_Core_NewNotifications_Id""
                 FOREIGN KEY (""NotificationId"") REFERENCES ""Core_Notifications""(""Id"");
             ");

            //  Changed the FK Constraint name on the table Core_HumanActivityConfigurations
            IfDatabase("SqlServer").Execute.Sql(@"
                 ALTER TABLE Core_HumanActivityConfigurations 
                 DROP CONSTRAINT FK_Core_HumanActivityConfigurations_NotificationOnPositiveResultId_Core_Notifications_Id

                 ALTER TABLE Core_HumanActivityConfigurations
                 ADD CONSTRAINT FK_Core_HumanActivityConfigurations_NotificationOnPositiveResultId_Core_NewNotifications_Id
                 FOREIGN KEY (NotificationOnPositiveResultId) REFERENCES Core_Notifications(Id);
             ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                 ALTER TABLE ""Core_HumanActivityConfigurations"" 
                 DROP CONSTRAINT ""FK_Core_HumanActivityConfigurations_NotificationOnPositiveResultId_Core_Notifications_Id"";

                 ALTER TABLE ""Core_HumanActivityConfigurations""
                 ADD CONSTRAINT ""FK_Core_HumanActivityConfigurations_NotificationOnPositiveResultId_Core_NewNotifications_Id""
                 FOREIGN KEY (""NotificationOnPositiveResultId"") REFERENCES ""Core_Notifications""(""Id"");
             ");

            //Drop the old tables
            Delete.Table("Core_OldNotificationMessages");
            Delete.Table("Core_OldNotificationTemplates");
            Delete.Table("Core_OldNotifications");

            //rename the column
            Rename.Column("Core_CanOtpOut").OnTable("Core_NotificationTypeConfigs").To("Core_CanOptOut");
        }
        public override void Down()
        {


        }
    }
 
}
