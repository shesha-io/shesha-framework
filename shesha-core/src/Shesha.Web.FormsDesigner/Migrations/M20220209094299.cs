using FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20220209094299)]
    public class M20220209094299 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_ConfigurableComponents").AddColumn("Type").AsString(100).Nullable();
        }
    }
}
