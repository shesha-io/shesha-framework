using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120399)]
    public class M20250623120399 : OneWayMigration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_Core_NotificationMessages_ChannelId_Core_NotificationChannelConfigs_Id").OnTable("Core_NotificationMessages");

            Create.ForeignKey("FK_Core_NotificationMessages_ChannelId")
                .FromTable("Core_NotificationMessages")
                .ForeignColumn("ChannelId")
                .ToTable("configuration_items")
                .InSchema("frwk")
                .PrimaryColumn("id");

            Delete.ForeignKey("FK_Core_UserNotificationPreferences_DefaultChannelId_Core_NotificationChannelConfigs_Id").OnTable("Core_UserNotificationPreferences");

            Create.ForeignKey("FK_Core_UserNotificationPreferences_DefaultChannelId")
                .FromTable("Core_UserNotificationPreferences")
                .ForeignColumn("DefaultChannelId")
                .ToTable("configuration_items")
                .InSchema("frwk")
                .PrimaryColumn("id");

            Delete.ForeignKey("FK_Core_Notifications_NotificationTypeId_Core_NotificationTypeConfigs_Id").OnTable("Core_Notifications");

            Create.ForeignKey("FK_Core_Notifications_NotificationTypeId")
                .FromTable("Core_Notifications")
                .ForeignColumn("NotificationTypeId")
                .ToTable("configuration_items")
                .InSchema("frwk")
                .PrimaryColumn("id");

            Execute.Sql(@"delete from ""Core_NotificationTemplates"" where ""PartOfId"" is null");

            Delete.ForeignKey("FK_Core_NotificationTemplates_PartOfId_Core_NotificationTypeConfigs_Id").OnTable("Core_NotificationTemplates");

            Create.ForeignKey("FK_Core_NotificationTemplates_PartOfId")
                .FromTable("Core_NotificationTemplates")
                .ForeignColumn("PartOfId")
                .ToTable("configuration_item_revisions")
                .InSchema("frwk")
                .PrimaryColumn("id");
                        
            Delete.ForeignKey("FK_Core_UserNotificationPreferences_NotificationTypeId_Core_NotificationTypeConfigs_Id").OnTable("Core_UserNotificationPreferences");
            Create.ForeignKey("FK_Core_UserNotificationPreferences_NotificationTypeId")
                .FromTable("Core_UserNotificationPreferences")
                .ForeignColumn("NotificationTypeId")
                .ToTable("configuration_items")
                .InSchema("frwk")
                .PrimaryColumn("id");

            Delete.Table("Core_NotificationChannelConfigs");
            Delete.Table("Core_NotificationTypeConfigs");
            Delete.Table("Core_ShaRoleAppointmentEntities");            
        }
    }
}