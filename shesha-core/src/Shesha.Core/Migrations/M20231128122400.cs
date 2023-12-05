
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20231128122400)]
    public class M20231128122400 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationMessages").AddColumn("Opened").AsBoolean().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("LastOpened").AsDateTime().Nullable();
        }
    }
}