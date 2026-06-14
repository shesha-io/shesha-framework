using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260614100000)]
    public class M20260614100000 : OneWayMigration
    {
        public override void Up()
        {
            // Move DefaultPriority from NotificationChannelConfigs to NotificationTypeConfigs
            Alter.Table("Core_NotificationTypeConfigs")
                .AddColumn("DefaultPriorityLkp").AsInt64().Nullable();

            Delete.Column("DefaultPriorityLkp").FromTable("Core_NotificationChannelConfigs");
        }
    }
}
