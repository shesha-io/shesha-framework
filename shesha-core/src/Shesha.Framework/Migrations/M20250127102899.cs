using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250127102899)]
    public class M20250127102899 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("SenderText").OnTable("Core_NotificationMessages").AsString(300).Nullable();
            Create.Column("cc").OnTable("Core_NotificationMessages").AsStringMax().Nullable();
        }
    }
}
