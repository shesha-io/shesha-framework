using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200303115100)]
    public class M20200303115100: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Areas").AddColumn("AreaTypeLkp").AsInt32().Nullable();
        }
    }
}
