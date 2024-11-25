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
    [Migration(20241106152600)]
    public class M20241106152600 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_NotificationTypeConfigs")
                   .WithIdAsGuid()
                   .WithColumn("Core_AllowAttachments").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_Disable").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_CanOtpOut").AsBoolean().WithDefaultValue(false)
                   .WithColumn("Core_Category").AsString(255).Nullable()
                   .WithColumn("Core_OrderIndex").AsInt32().Nullable()
                   .WithColumn("Core_OverrideChannels").AsStringMax().Nullable();

            Create.ForeignKey("FK_Core_NotificationTypeConfigs_Frwk_ConfigurationItems_Id")
                  .FromTable("Core_NotificationTypeConfigs")
                  .ForeignColumn("Id")
                  .ToTable("Frwk_ConfigurationItems")
                  .PrimaryColumn("Id");

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


            ///// TODO: Decide between adding new entity or altering the 'NotificationTemplate' entity
            Create.Table("Core_MessageTemplates")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_NotificationTypeConfigs")
                  .WithColumn("TitleTemplate").AsString(2000).Nullable()
                  .WithColumn("BodyTemplate").AsString(int.MaxValue).Nullable()
                  .WithColumn("MessageFormatLkp").AsInt64().Nullable();


            Create.Table("Core_OmoNotifications")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithColumn("Name").AsString().Nullable()
                  .WithForeignKeyColumn("NotificationTypeId", "Core_NotificationTypeConfigs")
                  .WithForeignKeyColumn("ToPersonId", "Core_Persons")
                  .WithForeignKeyColumn("FromPersonId", "Core_Persons")
                  .WithColumn("NotificationData").AsString(int.MaxValue).Nullable()
                  .WithColumn("PriorityLkp").AsInt64().Nullable()
                  .WithColumn("TriggeringEntityId").AsString(100).Nullable()
                  .WithColumn("TriggeringEntityClassName").AsString(1000).Nullable()
                  .WithColumn("TriggeringEntityDisplayName").AsString(1000).Nullable();

            Create.Table("Core_OmoNotificationMessages")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_OmoNotifications")
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
                  .WithColumn(DatabaseConsts.ExtSysFirstSyncDate).AsDateTime().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysId).AsString(50).Nullable()
                  .WithColumn(DatabaseConsts.ExtSysLastSyncDate).AsDateTime().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSource).AsString(50).Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSyncError).AsStringMax().Nullable()
                  .WithColumn(DatabaseConsts.ExtSysSyncStatusLkp).AsInt32().Nullable();

            Alter.Table("Core_OmoNotificationMessages")
                  .AddTenantIdColumnAsNullable();

            Create.Table("Core_UserNotificationPreferences")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("UserId", "Core_Persons")
                .WithForeignKeyColumn("NotificationTypeId", "Core_NotificationTypeConfigs")
                .WithColumn("OptOut").AsBoolean().WithDefaultValue(false)
                .WithForeignKeyColumn("DefaultChannelId", "Core_NotificationChannelConfigs");

            Create.Table("Core_NotificationTopics")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Name").AsString(255).NotNullable()
                .WithColumn("Description").AsString(int.MaxValue).Nullable();

            Create.Table("Core_UserTopicSubscriptions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("TopicId", "Core_NotificationTopics")
                .WithForeignKeyColumn("UserId", "Core_Persons");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
