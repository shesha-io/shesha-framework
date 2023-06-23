using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230302160800), MsSqlOnly]
    public class M20230302160800 : Migration
    {
        public override void Up()
        {
            Delete.Column("PriorityLkp").FromTable("Core_Notes");
            Alter.Table("Core_Notes").AddColumn("VisibilityTypeLkp").AsInt64().Nullable();
            Alter.Table("Core_Notes").AddColumn("HasAttachment").AsBoolean().WithDefaultValue(false);
        }
        public override void Down()
        {
        }
    }
}