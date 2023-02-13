using FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20210107095200)]
    public class M20210107095200: AutoReversingMigration
    {
        public override void Up()
        {
            Rename.Table("Forms").To("Frwk_Forms");
        }
    }
}
