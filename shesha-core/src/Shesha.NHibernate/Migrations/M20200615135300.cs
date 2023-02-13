using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200615135300)]
    public class M20200615135300: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationMessages").AddTenantIdColumnAsNullable()
                .AddForeignKeyColumn("TenantNotificationId", "AbpTenantNotifications");
        }
    }
}
