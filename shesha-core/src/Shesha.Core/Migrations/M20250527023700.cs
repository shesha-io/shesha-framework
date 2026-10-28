using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250527023700)]
    public class M20250527023700 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Notes")
              .AlterColumn("CategoryLkp")
              .AsString(50)
              .Nullable();

            Rename.Column("CategoryLkp").OnTable("Core_Notes").To("Category");
        }
    }
}
