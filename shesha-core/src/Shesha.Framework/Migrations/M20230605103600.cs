using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230605103600)]
    public class M20230605103600 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationMessages").AddColumn("SenderText").AsString().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("DirectionLkp").AsInt64().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("Cc").AsString().Nullable();
        }
    }
}
