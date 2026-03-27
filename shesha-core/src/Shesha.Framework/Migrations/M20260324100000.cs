using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260324100000)]
    public class M20260324100000 : OneWayMigration
    {
        public override void Up()
        {
            // Link startup assembly records to their Shesha module for deployment auditing
            Alter.Table("frwk_application_startup_assemblies")
                .AddColumn("module_id").AsGuid().Nullable()
                .ForeignKey("fk_frwk_startup_assemblies_module", "Frwk_Modules", "Id");
        }
    }
}
