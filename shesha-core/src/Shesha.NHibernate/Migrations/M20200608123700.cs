using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200608123700)]
    public class M20200608123700: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.NotificationTemplate
            Alter.Table("Core_NotificationTemplates")
                .AddForeignKeyColumn("NotificationId", "Core_Notifications")
                .AddColumn("SendTypeLkp").AsInt32().Nullable()
                .AddColumn("TemplateFormatLkp").AsInt32().Nullable();
        }
    }
}
