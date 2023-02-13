using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200608141500)]
    public class M20200608141500: AutoReversingMigration
    {
        public override void Up()
        {
            Rename.Column("TemplateFormatLkp").OnTable("Core_NotificationTemplates").To("BodyFormatLkp");

            Alter.Table("Core_NotificationTemplates").AddColumn("IsEnabled").AsBoolean().WithDefaultValue(0);
        }
    }
}
