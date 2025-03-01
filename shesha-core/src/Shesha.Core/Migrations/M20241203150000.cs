using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20241203150000)]
    public class M20241203150000 : Migration
    {
        public override void Up()
        {
            // Drop constraints based on database type
            IfDatabase("SqlServer").Execute.Sql(@"
                    -- Get all table names we're working with
                    DECLARE @TableNames TABLE (TableName sysname);
                    INSERT INTO @TableNames VALUES 
                        ('Core_NotificationMessages'),
                        ('Core_NotificationTemplates'),
                        ('Core_Notifications');

                    DECLARE @SQL NVARCHAR(MAX) = '';

                    -- Drop all foreign keys referencing our tables (including audit columns)
                    SELECT @SQL = @SQL + 'ALTER TABLE ' + OBJECT_SCHEMA_NAME(parent_object_id) + '.' + OBJECT_NAME(parent_object_id) + 
                        ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
                    FROM sys.foreign_keys fk
                    WHERE referenced_object_id IN (SELECT OBJECT_ID(TableName) FROM @TableNames)
                       OR parent_object_id IN (SELECT OBJECT_ID(TableName) FROM @TableNames);

                    -- Drop all default constraints
                    SELECT @SQL = @SQL + 'ALTER TABLE ' + OBJECT_SCHEMA_NAME(parent_object_id) + '.' + OBJECT_NAME(parent_object_id) +
                        ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
                    FROM sys.default_constraints dc
                    WHERE parent_object_id IN (SELECT OBJECT_ID(TableName) FROM @TableNames);

                    -- Drop check constraints
                    SELECT @SQL = @SQL + 'ALTER TABLE ' + OBJECT_SCHEMA_NAME(parent_object_id) + '.' + OBJECT_NAME(parent_object_id) +
                        ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
                    FROM sys.check_constraints cc
                    WHERE parent_object_id IN (SELECT OBJECT_ID(TableName) FROM @TableNames);

                    -- Drop primary keys
                    SELECT @SQL = @SQL + 'ALTER TABLE ' + OBJECT_SCHEMA_NAME(parent_object_id) + '.' + OBJECT_NAME(parent_object_id) +
                        ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
                    FROM sys.key_constraints kc
                    WHERE parent_object_id IN (SELECT OBJECT_ID(TableName) FROM @TableNames)
                    AND type = 'PK';

                    -- Execute all drops
                    EXEC sp_executesql @SQL;
                ");

            IfDatabase("PostgreSql").
                Execute.Sql(@"
                    DO $$ 
                    DECLARE
                        r RECORD;
                    BEGIN
                        -- Drop foreign keys
                        FOR r IN (SELECT tc.table_schema, 
                                       tc.constraint_name, 
                                       tc.table_name
                                FROM information_schema.table_constraints tc
                                WHERE tc.constraint_type = 'FOREIGN KEY'
                                  AND (tc.table_name IN ('Core_NotificationMessages', 
                                                       'Core_NotificationTemplates', 
                                                       'Core_Notifications')
                                   OR EXISTS (
                                      SELECT 1 
                                      FROM information_schema.constraint_column_usage ccu
                                      WHERE ccu.constraint_name = tc.constraint_name
                                        AND ccu.table_name IN ('Core_NotificationMessages', 
                                                             'Core_NotificationTemplates', 
                                                             'Core_Notifications')
                                   )))
                        LOOP
                            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) 
                                || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                        END LOOP;

                        -- Drop primary keys
                        FOR r IN (SELECT tc.table_schema, 
                                       tc.constraint_name, 
                                       tc.table_name
                                FROM information_schema.table_constraints tc
                                WHERE tc.constraint_type = 'PRIMARY KEY'
                                  AND tc.table_name IN ('Core_NotificationMessages', 
                                                      'Core_NotificationTemplates', 
                                                      'Core_Notifications'))
                        LOOP
                            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) 
                                || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                        END LOOP;

                        -- Drop default constraints and check constraints
                        FOR r IN (SELECT tc.table_schema, 
                                       tc.constraint_name, 
                                       tc.table_name
                                FROM information_schema.table_constraints tc
                                WHERE tc.constraint_type IN ('CHECK', 'DEFAULT')
                                  AND tc.table_name IN ('Core_NotificationMessages', 
                                                      'Core_NotificationTemplates', 
                                                      'Core_Notifications'))
                        LOOP
                            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) 
                                || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
                        END LOOP;
                    END $$;
                ");

            // For PostgreSQL, we also need to drop default values set using ALTER COLUMN
            IfDatabase("PostgreSql").Execute.Sql(@"
                    DO $$ 
                    DECLARE
                        r RECORD;
                    BEGIN
                        FOR r IN (
                            SELECT table_schema, table_name, column_name
                            FROM information_schema.columns
                            WHERE table_name IN ('Core_NotificationMessages', 
                                               'Core_NotificationTemplates', 
                                               'Core_Notifications')
                            AND column_default IS NOT NULL
                        )
                        LOOP
                            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || 
                                    quote_ident(r.table_name) || 
                                    ' ALTER COLUMN ' || quote_ident(r.column_name) || 
                                    ' DROP DEFAULT';
                        END LOOP;
                    END $$;
                ");

            // Now rename existing tables to their "Old" names
            Rename.Table("Core_NotificationMessages").To("Core_OldNotificationMessages");
            Rename.Table("Core_NotificationTemplates").To("Core_OldNotificationTemplates");
            Rename.Table("Core_Notifications").To("Core_OldNotifications");

            // Add primary keys to old tables to maintain referential integrity during migration
            Create.PrimaryKey("PK_Core_OldNotificationMessages")
                .OnTable("Core_OldNotificationMessages")
                .Column("Id");
            Create.PrimaryKey("PK_Core_OldNotificationTemplates")
                .OnTable("Core_OldNotificationTemplates")
                .Column("Id");
            Create.PrimaryKey("PK_Core_OldNotifications")
                .OnTable("Core_OldNotifications")
                .Column("Id");

            // Restore the foreign key for attachments on the old table
            Create.ForeignKey("FK_Core_NotificationMessageAttachments_MessageId_Core_OldNotificationMessages_Id")
                .FromTable("Core_NotificationMessageAttachments")
                .ForeignColumn("MessageId")
                .ToTable("Core_OldNotificationMessages")
                .PrimaryColumn("Id");

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

            // Create new tables with final names (without 'New' prefix)
            Create.Table("Core_NotificationTemplates")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_NotificationTypeConfigs")
                  .WithColumn("TitleTemplate").AsString(2000).Nullable()
                  .WithColumn("BodyTemplate").AsString(int.MaxValue).Nullable()
                  .WithColumn("MessageFormatLkp").AsInt64().Nullable();

            Create.Table("Core_Notifications")
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

            Create.Table("Core_NotificationMessages")
                  .WithIdAsGuid()
                  .WithFullAuditColumns()
                  .WithForeignKeyColumn("PartOfId", "Core_Notifications")
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

            Alter.Table("Core_NotificationMessages")
                  .AddTenantIdColumnAsNullable();
            
            // Data migration
            IfDatabase("SqlServer").Execute.Sql(@"
                INSERT INTO Core_Notifications (Id, CreationTime, Name, ToPersonId, FromPersonId, TriggeringEntityId, TriggeringEntityClassName, TriggeringEntityDisplayName, IsDeleted) 
                SELECT 
	                nm.Id,
	                nm.CreationTime,
                    n.Name,
                    nm.RecipientId,
                    nm.SenderId,
                    nm.SourceEntityId,
                    nm.SourceEntityClassName,
                    nm.SourceEntityDisplayName,
                    nm.IsDeleted
                FROM Core_OldNotificationMessages nm
                left JOIN Core_OldNotifications n ON n.Id = nm.NotificationId
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                INSERT INTO Core_NotificationMessages (Id, CreationTime, PartOfId, ChannelId, RecipientText, Subject, Message, RetryCount, DirectionLkp, ReadStatusLkp, FirstDateRead, DateSent, ErrorMessage, StatusLkp, IsDeleted)
                SELECT 
	                Id,
	                CreationTime,
	                Id,
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
                    StatusLkp,
                    IsDeleted
                FROM Core_OldNotificationMessages
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                INSERT INTO Core_NotificationTemplates (Id, TitleTemplate, BodyTemplate, MessageFormatLkp, IsDeleted)
                SELECT 
	                Id,
	                Subject,
	                Body,
	                BodyFormatLkp,
                    IsDeleted
                FROM Core_OldNotificationTemplates
            ");

            // Finally, update the NotificationMessageAttachments foreign key to point to new table
            IfDatabase("SqlServer").Execute.Sql(@"
                ALTER TABLE Core_NotificationMessageAttachments 
                DROP CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_OldNotificationMessages_Id;

                ALTER TABLE Core_NotificationMessageAttachments 
                ADD CONSTRAINT FK_Core_NotificationMessageAttachments_MessageId_Core_NotificationMessages_Id
                FOREIGN KEY (MessageId) REFERENCES Core_NotificationMessages(Id);
            ");

            // PostgreSQL
            IfDatabase("PostgreSQL").Execute.Sql(@"
                -- Migrate core notifications from old to new schema
                INSERT INTO ""Core_Notifications"" (
                    ""Id"", 
                    ""CreationTime"", 
                    ""Name"", 
                    ""ToPersonId"", 
                    ""FromPersonId"", 
                    ""TriggeringEntityId"", 
                    ""TriggeringEntityClassName"", 
                    ""TriggeringEntityDisplayName"",
                    ""IsDeleted""
                ) 
                SELECT 
                    nm.""Id"",
                    nm.""CreationTime"",
                    n.""Name"",
                    nm.""RecipientId"",
                    nm.""SenderId"",
                    nm.""SourceEntityId"",
                    nm.""SourceEntityClassName"",
                    nm.""SourceEntityDisplayName"",
                    nm.""IsDeleted""
                FROM ""Core_OldNotificationMessages"" nm
                left JOIN ""Core_OldNotifications"" n ON n.""Id"" = nm.""NotificationId""
            ");

            IfDatabase("PostgreSQL").Execute.Sql(@"
                -- Migrate notification messages with channel mapping
                INSERT INTO ""Core_NotificationMessages"" (
                    ""Id"",
                    ""CreationTime"",
                    ""PartOfId"",
                    ""ChannelId"",
                    ""RecipientText"",
                    ""Subject"",
                    ""Message"",
                    ""RetryCount"",
                    ""DirectionLkp"",
                    ""ReadStatusLkp"",
                    ""FirstDateRead"",
                    ""DateSent"",
                    ""ErrorMessage"",
                    ""StatusLkp"",
                    ""IsDeleted""
                )
                SELECT 
                    ""Id"",
                    ""CreationTime"",
                    ""Id"",
                    CASE 
                        WHEN ""SendTypeLkp"" = 1 THEN 
                            (SELECT ""Id"" FROM ""Core_NotificationChannelConfigs"" ncc WHERE ncc.""Core_SenderTypeName"" = 'EmailChannelSender')
                        WHEN ""SendTypeLkp"" = 2 THEN 
                            (SELECT ""Id"" FROM ""Core_NotificationChannelConfigs"" ncc WHERE ncc.""Core_SenderTypeName"" = 'SmsChannelSender')
                        ELSE NULL
                    END,
                    ""RecipientText"",
                    ""Subject"",
                    ""Body"",
                    ""TryCount"",
                    ""DirectionLkp"",
                    CASE WHEN ""Opened"" = true THEN 0 ELSE 1 END,
                    ""LastOpened"",
                    ""SendDate"",
                    ""ErrorMessage"",
                    ""StatusLkp"",
                    ""IsDeleted""
                FROM ""Core_OldNotificationMessages""
            ");

            IfDatabase("PostgreSQL").Execute.Sql(@"
                -- Migrate notification templates
                INSERT INTO ""Core_NotificationTemplates"" (
                    ""Id"",
                    ""TitleTemplate"",
                    ""BodyTemplate"",
                    ""MessageFormatLkp"",
                    ""IsDeleted""
                )
                SELECT 
                    ""Id"",
                    ""Subject"",
                    ""Body"",
                    ""BodyFormatLkp"",
                    ""IsDeleted""
                FROM ""Core_OldNotificationTemplates""
            ");

            IfDatabase("PostgreSQL").Execute.Sql(@"
                -- Update foreign key constraint for notification message attachments
                ALTER TABLE ""Core_NotificationMessageAttachments"" 
                DROP CONSTRAINT ""FK_Core_NotificationMessageAttachments_MessageId_Core_OldNotificationMessages_Id"";

                ALTER TABLE ""Core_NotificationMessageAttachments"" 
                ADD CONSTRAINT ""FK_Core_NotificationMessageAttachments_MessageId_Core_NotificationMessages_Id""
                FOREIGN KEY (""MessageId"") REFERENCES ""Core_NotificationMessages""(""Id"");
            ");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
