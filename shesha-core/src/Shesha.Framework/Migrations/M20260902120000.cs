using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260902120000), MsSqlOnly]
    public class M20260902120000 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_ApiPermissionsManifests")
                .WithIdAsGuid();

            Create.ForeignKey("FK_Frwk_ApiPermissionsManifests_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_ApiPermissionsManifests")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");
        }
    }
}
