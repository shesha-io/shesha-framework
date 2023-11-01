using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20231030140800)]
    public class M20231030140800 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("TargetingFlag").AsInt64().Nullable();
        }
    }
}
