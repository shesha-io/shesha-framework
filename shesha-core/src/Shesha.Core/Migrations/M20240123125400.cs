
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240123125400)]
    public class M20240123125400 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Sites").AddColumn("ContactNumber").AsString(20).Nullable();
        }
    }
}