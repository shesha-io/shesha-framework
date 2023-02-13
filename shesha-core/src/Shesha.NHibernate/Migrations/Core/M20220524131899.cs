using FluentMigrator;

namespace Shesha.Migrations.Core
{
    [Migration(20220524131899)]
    public class M20220524131899 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations").AddColumn("ContactMobileNo").AsString(50).Nullable();
            Alter.Table("Core_Organisations").AddColumn("ContactEmail").AsString(200).Nullable();
        }
    }
}
