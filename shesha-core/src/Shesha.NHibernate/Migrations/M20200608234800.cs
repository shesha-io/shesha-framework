using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200608234800)]
    public class M20200608234800: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.NotificationMessage
            Create.Table("Core_NotificationMessages")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Body").AsStringMax().Nullable()
                .WithColumn("ErrorMessage").AsStringMax().Nullable()
                .WithForeignKeyColumn("NotificationId", "Core_Notifications")
                .WithForeignKeyColumn("RecipientId", "Core_Persons")
                .WithColumn("RecipientText").AsString(300).Nullable()
                .WithColumn("SendDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("SenderId", "Core_Persons")
                .WithColumn("SendTypeLkp").AsInt32()
                .WithColumn("StatusLkp").AsInt32()
                .WithColumn("Subject").AsString(300).Nullable()
                .WithForeignKeyColumn("TemplateId", "Core_NotificationTemplates")
                .WithColumn("TryCount").AsInt32();
        }
    }
}
