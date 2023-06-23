using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20230110170799), MsSqlOnly]
    public class M20230110170799 : OneWayMigration
    {
        public override void Up()
        {
            Delete.Column("Frwk_Discriminator").FromTable("Frwk_ConfigurableComponents");
        }
    }
}
