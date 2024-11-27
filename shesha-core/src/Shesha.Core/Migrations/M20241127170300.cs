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
    [Migration(20241127170300)]
    public class M20241127170300 : Migration
    {
        public override void Up()
        {
            // NotificationTypes
            Create.Table("Core_NotificationTypeConfigs")
                   .WithIdAsGuid()
                   .WithColumn("Core_AllowAttachments").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_Disable").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_CanOtpOut").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_Category").AsString(255).Nullable()
                   .WithColumn("Core_OrderIndex").AsInt32().Nullable()
                   .WithColumn("Core_IsTimeSensitive").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_OverrideChannels").AsStringMax().Nullable();

            Create.ForeignKey("FK_Core_NotificationTypeConfigs_Frwk_ConfigurationItems_Id")
                  .FromTable("Core_NotificationTypeConfigs")
                  .ForeignColumn("Id")
                  .ToTable("Frwk_ConfigurationItems")
                  .PrimaryColumn("Id");

            // NotificationChannels
            Create.Table("Core_NotificationChannelConfigs")
                   .WithIdAsGuid()
                   .WithColumn("Core_SupportedFormatLkp").AsInt64().Nullable()
                   .WithColumn("Core_MaxMessageSize").AsInt32().Nullable()
                   .WithColumn("Core_SupportedMechanismLkp").AsInt64().Nullable()
                   .WithColumn("Core_SenderTypeName").AsString(255).Nullable()
                   .WithColumn("Core_DefaultPriorityLkp").AsInt64().Nullable()
                   .WithColumn("Core_StatusLkp").AsInt64().Nullable();

            Create.ForeignKey("FK_Core_NotificationChannelConfigs_Frwk_ConfigurationItems_Id")
                  .FromTable("Core_NotificationChannelConfigs")
                  .ForeignColumn("Id")
                  .ToTable("Frwk_ConfigurationItems")
                  .PrimaryColumn("Id");

            // NotificationGateways
            Create.Table("Core_NotificationGatewayConfigs")
                   .WithIdAsGuid()
                   .WithForeignKeyColumn("Core_PartOfId", "Core_NotificationChannelConfigs")
                   .WithColumn("Core_GatewayTypeName").AsString(255).Nullable();

            Create.ForeignKey("FK_Core_NotificationGatewayConfigs_Frwk_ConfigurationItems_Id")
                  .FromTable("Core_NotificationGatewayConfigs")
                  .ForeignColumn("Id")
                  .ToTable("Frwk_ConfigurationItems")
                  .PrimaryColumn("Id");

            // User Notification Preferences
            Create.Table("Core_UserNotificationPreferences")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("UserId", "Core_Persons")
                  .WithForeignKeyColumn("NotificationTypeId", "Core_NotificationTypeConfigs")
                  .WithColumn("OptOut").AsBoolean().WithDefaultValue(false)
                  .WithForeignKeyColumn("DefaultChannelId", "Core_NotificationChannelConfigs");

            // Notification Topics
            Create.Table("Core_NotificationTopics")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Name").AsString(255).NotNullable()
                .WithColumn("Description").AsString(int.MaxValue).Nullable();

            // User Topic Subscriptions
            Create.Table("Core_UserTopicSubscriptions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("TopicId", "Core_NotificationTopics")
                .WithForeignKeyColumn("UserId", "Core_Persons");

            // New NotificationTemplates
            Create.Table("Core_NewNotificationTemplates")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_NotificationTypeConfigs")
                  .WithColumn("TitleTemplate").AsString(2000).Nullable()
                  .WithColumn("BodyTemplate").AsString(int.MaxValue).Nullable()
                  .WithColumn("MessageFormatLkp").AsInt64().Nullable();

            // New Notifications
            Create.Table("Core_NewNotifications")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithColumn("Name").AsString().Nullable()
                  .WithForeignKeyColumn("NotificationTypeId", "Core_NotificationTypeConfigs")
                  .WithForeignKeyColumn("ToPersonId", "Core_Persons")
                  .WithForeignKeyColumn("FromPersonId", "Core_Persons")
                  .WithForeignKeyColumn("NotificationTopicId", "Core_NotificationTopics")
                  .WithColumn("NotificationData").AsString(int.MaxValue).Nullable()
                  .WithColumn("PriorityLkp").AsInt64().Nullable()
                  .WithColumn("TriggeringEntityId").AsString(100).Nullable()
                  .WithColumn("TriggeringEntityClassName").AsString(1000).Nullable()
                  .WithColumn("TriggeringEntityDisplayName").AsString(1000).Nullable();

            // New NotificationMessages
            Create.Table("Core_NewNotificationMessages")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_NewNotifications")
                  .WithForeignKeyColumn("ChannelId", "Core_NotificationChannelConfigs")
                  .WithColumn("RecipientText").AsString(int.MaxValue).Nullable()
                  .WithColumn("Subject").AsString(1000).Nullable()
                  .WithColumn("Message").AsString(int.MaxValue).Nullable()
                  .WithColumn("RetryCount").AsInt32().WithDefaultValue(0)
                  .WithColumn("DirectionLkp").AsInt64().Nullable()
                  .WithColumn("ReadStatusLkp").AsInt64().Nullable()
                  .WithColumn("FirstDateRead").AsDateTime().Nullable()
                  .WithColumn("DateSent").AsDateTime().Nullable()
                  .WithColumn("ErrorMessage").AsString(int.MaxValue).Nullable()
                  .WithColumn("StatusLkp").AsInt64().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysFirstSyncDate).AsDateTime().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysId).AsString(50).Nullable()
                  .WithColumn(DatabaseConsts.ExtSysLastSyncDate).AsDateTime().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSource).AsString(50).Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSyncError).AsStringMax().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSyncStatusLkp).AsInt32().Nullable();

            Alter.Table("Core_NewNotificationMessages")
                  .AddTenantIdColumnAsNullable();

            Execute.Sql(@"
                INSERT INTO Core_NewNotifications (Id, CreationTime, Name, ToPersonId, FromPersonId, TriggeringEntityId, TriggeringEntityClassName, TriggeringEntityDisplayName) 
                SELECT 
	                NEWID(),
	                nm.CreationTime,
                    n.Name,
                    nm.RecipientId,
                    nm.SenderId,
                    nm.SourceEntityId,
                    nm.SourceEntityClassName,
                    nm.SourceEntityDisplayName
                FROM Core_Notifications n
                LEFT JOIN Core_NotificationMessages nm ON n.Id = nm.NotificationId
                WHERE nm.IsDeleted = 0 AND n.IsDeleted = 0;
            ");

            Execute.Sql(@"
                INSERT INTO Core_NewNotificationMessages (Id, CreationTime, PartOfId, ChannelId, RecipientText, Subject, Message,RetryCount, DirectionLkp, ReadStatusLkp, FirstDateRead,DateSent, ErrorMessage, StatusLkp)
                SELECT 
	                Id,
	                CreationTime,
	                NotificationId,
                    CASE 
                        WHEN SendTypeLkp = 1 THEN 
                            (SELECT Id FROM Core_NotificationChannelConfigs ncc WHERE ncc.Core_SenderTypeName = 'EmailChannelSender')
                        WHEN SendTypeLkp = 2 THEN 
                            (SELECT Id FROM Core_NotificationChannelConfigs ncc WHERE ncc.Core_SenderTypeName = 'SmsChannelSender')
                        ELSE NULL
                    END,
                    RecipientText,
                    Subject,
                    Body,
                    TryCount,
                    DirectionLkp,
                    CASE WHEN Opened = 1 THEN 0 ELSE 1 END,
                    LastOpened,
                    SendDate,
                    ErrorMessage,
                    StatusLkp
                FROM Core_NotificationMessages
                WHERE IsDeleted = 0;
            ");


            Execute.Sql(@"
                INSERT INTO Core_NewNotificationTemplates (Id, TitleTemplate, BodyTemplate, MessageFormatLkp)
                SELECT 
	                Id,
	                Subject,
	                Body,
	                BodyFormatLkp
                FROM Core_NotificationTemplates
                WHERE IsDeleted = 0;
            ");


            Rename.Table("Core_NotificationMessages").To("Core_OldNotificationMessages");
            Rename.Table("Core_NotificationTemplates").To("Core_OldNotificationTemplates");
            Rename.Table("Core_Notifications").To("Core_OldNotifications");

            Rename.Table("Core_NewNotifications").To("Core_Notifications");
            Rename.Table("Core_NewNotificationMessages").To("Core_NotificationMessages");
            Rename.Table("Core_NewNotificationTemplates").To("Core_NotificationTemplates");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
