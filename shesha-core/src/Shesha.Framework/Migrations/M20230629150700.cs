using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230629150700)]
    public class M20230629150700 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Accounts").AddColumn("AccountNo").AsString().Nullable();
            Alter.Table("Core_Accounts").AddColumn("StatusLkp").AsInt64().Nullable();
            Alter.Table("Core_Accounts").AddColumn("AccountTypeLkp").AsInt64().Nullable();
            Alter.Table("Core_Accounts").AddColumn("ActiveFromDate").AsDateTime().Nullable();
            Alter.Table("Core_Accounts").AddColumn("ActiveToDate").AsDateTime().Nullable();

        }
    }
}
