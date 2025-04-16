using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250123114500)]
    public class M20250123114500: Migration
    {
        public override void Up()
        {
            //Delete Old Tables
            Delete.Table("Core_OldNotificationMessages");
            Delete.Table("Core_OldNotificationTemplates");
            Delete.Table("Core_OldNotifications");
        }

        public override void Down()
        {

        }

    }
}
