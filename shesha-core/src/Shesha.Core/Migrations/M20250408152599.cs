using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250408152599)]
    public class M20250408152599 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Notifications").AddColumn("Category").AsString(50).NotNullable().SetExistingRowsTo("").WithDefaultValue("");
        }
    }
}
