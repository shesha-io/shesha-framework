using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230920125900)]
    public class M20230920125900 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Accounts").AddColumn("ContactEmail").AsString().Nullable();
            Alter.Table("Core_Accounts").AddColumn("ContactMobileNo").AsInt64().Nullable();

        }
    }
}
