using FluentMigrator;

namespace Shesha.Enterprise.Migrations
{
    [Migration(20200903000300)]
    public class M20200903000300 : AutoReversingMigration
    {

        public override void Up()
        {
            Alter.Table("Core_Organisations").AddColumn("StatusLkp").AsInt32().Nullable();
        }
    }
}
