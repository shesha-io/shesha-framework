using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260909100000)]
    public class M20260909100000 : OneWayMigration
    {
        public override void Up()
        {
            // Move DefaultPriority from notification_channels to notification_types
            Alter.Table("notification_types").InSchema("frwk")
                .AddColumn("default_priority_lkp").AsInt64().Nullable();

            Delete.Column("default_priority_lkp").FromTable("notification_channels").InSchema("frwk");
        }
    }
}
